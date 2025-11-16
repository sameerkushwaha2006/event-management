import mongoose, { Schema, Document } from 'mongoose';

// Payment document interface
export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  registrationId: mongoose.Types.ObjectId;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentMethod: string;
  receiptEmail: string;
  stripeChargeId?: string;
  failureReason?: string;
  failureCode?: string;
  createdAt: Date;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  refundId?: string;
  metadata?: Record<string, string>;

  // Methods
  isPaid(): boolean;
  isRefunded(): boolean;
  isFailed(): boolean;
  getFormattedAmount(): string;
  getRefundableAmount(): number;
}

const paymentSchema = new Schema<IPayment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  registrationId: {
    type: Schema.Types.ObjectId,
    ref: 'Registration',
    required: [true, 'Registration ID is required']
  },
  stripePaymentIntentId: {
    type: String,
    required: [true, 'Stripe Payment Intent ID is required'],
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.5, 'Minimum payment amount is $0.50'], // Stripe minimum
    max: [999999.99, 'Maximum payment amount is $999,999.99']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['card', 'apple_pay', 'google_pay', 'bank_transfer'],
    default: 'card'
  },
  receiptEmail: {
    type: String,
    required: [true, 'Receipt email is required'],
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  stripeChargeId: {
    type: String,
    default: null
  },
  failureReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Failure reason cannot exceed 500 characters']
  },
  failureCode: {
    type: String,
    trim: true,
    maxlength: [50, 'Failure code cannot exceed 50 characters']
  },
  refundedAt: {
    type: Date,
    default: null
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
    validate: {
      validator: function(this: IPayment, value: number) {
        return !value || value <= this.amount;
      },
      message: 'Refund amount cannot exceed original payment amount'
    }
  },
  refundReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Refund reason cannot exceed 500 characters']
  },
  refundId: {
    type: String,
    default: null
  },
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
paymentSchema.index({ userId: 1 });
paymentSchema.index({ eventId: 1 });
paymentSchema.index({ registrationId: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 }, { unique: true });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ refundedAt: -1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Virtual for formatted refund amount
paymentSchema.virtual('formattedRefundAmount').get(function() {
  if (!this.refundAmount) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.refundAmount);
});

// Virtual for net amount (amount minus refund)
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - (this.refundAmount || 0);
});

// Virtual for formatted net amount
paymentSchema.virtual('formattedNetAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.netAmount);
});

// Instance method to check if payment is paid
paymentSchema.methods.isPaid = function(): boolean {
  return this.status === 'succeeded';
};

// Instance method to check if payment is refunded
paymentSchema.methods.isRefunded = function(): boolean {
  return this.status === 'refunded';
};

// Instance method to check if payment is failed
paymentSchema.methods.isFailed = function(): boolean {
  return this.status === 'failed';
};

// Instance method to get formatted amount
paymentSchema.methods.getFormattedAmount = function(): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
};

// Instance method to get refundable amount
paymentSchema.methods.getRefundableAmount = function(): number {
  return this.amount - (this.refundAmount || 0);
};

// Pre-save middleware to set refundedAt when refund is processed
paymentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'refunded' && !this.refundedAt) {
    this.refundedAt = new Date();
  }
  next();
});

// Static method to find payments by user
paymentSchema.statics.findByUser = function(userId: mongoose.Types.ObjectId, options: any = {}) {
  const query: any = { userId };
  if (options.status) {
    query.status = options.status;
  }
  if (options.eventId) {
    query.eventId = options.eventId;
  }

  return this.find(query)
    .populate('eventId', 'title startDate')
    .sort({ createdAt: -1 });
};

// Static method to find payments by event
paymentSchema.statics.findByEvent = function(eventId: mongoose.Types.ObjectId) {
  return this.find({ eventId })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(eventId?: mongoose.Types.ObjectId) {
  const matchStage = eventId ? { eventId: new mongoose.Types.ObjectId(eventId) } : {};

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const result: any = {
    total: 0,
    totalAmount: 0,
    succeeded: { count: 0, amount: 0 },
    failed: { count: 0, amount: 0 },
    refunded: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 }
  };

  stats.forEach(stat => {
    result.total += stat.count;
    result.totalAmount += stat.totalAmount;
    if (result[stat._id]) {
      result[stat._id].count = stat.count;
      result[stat._id].amount = stat.totalAmount;
    }
  });

  return result;
};

// Static method to find payments requiring refunds
paymentSchema.statics.findRefundablePayments = function() {
  return this.find({
    status: 'succeeded',
    $expr: { $gt: ['$amount', { $ifNull: ['$refundAmount', 0] }] }
  });
};

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;