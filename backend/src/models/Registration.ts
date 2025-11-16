import mongoose, { Schema, Document } from 'mongoose';

// Emergency contact interface
export interface IEmergencyContact {
  name: string;
  phone: string;
  email?: string;
}

// Attendee information interface
export interface IAttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialRequirements?: string;
  emergencyContact?: IEmergencyContact;
}

// Registration document interface
export interface IRegistration extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  registeredAt: Date;
  ticketQuantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlisted';
  attendeeInfo: IAttendeeInfo;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  cancellationReason?: string;
  cancelledAt?: Date;
  refundAmount?: number;
  waitlistPosition?: number;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  isPaid(): boolean;
  isCancelled(): boolean;
  isWaitlisted(): boolean;
  getFormattedAmount(): string;
}

const emergencyContactSchema = new Schema<IEmergencyContact>({
  name: {
    type: String,
    required: [true, 'Emergency contact name is required'],
    trim: true,
    maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Emergency contact phone is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  }
}, { _id: false });

const attendeeInfoSchema = new Schema<IAttendeeInfo>({
  firstName: {
    type: String,
    required: [true, 'Attendee first name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Attendee last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Attendee email is required'],
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  specialRequirements: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requirements cannot exceed 500 characters']
  },
  emergencyContact: {
    type: emergencyContactSchema,
    default: null
  }
}, { _id: false });

const registrationSchema = new Schema<IRegistration>({
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
  registeredAt: {
    type: Date,
    default: Date.now
  },
  ticketQuantity: {
    type: Number,
    required: [true, 'Ticket quantity is required'],
    min: [1, 'Must register at least 1 ticket'],
    max: [10, 'Cannot register more than 10 tickets at once'],
    default: 1
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'waitlisted'],
    default: 'pending'
  },
  attendeeInfo: {
    type: attendeeInfoSchema,
    required: [true, 'Attendee information is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative']
  },
  waitlistPosition: {
    type: Number,
    min: [1, 'Waitlist position must be at least 1']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
registrationSchema.index({ userId: 1 });
registrationSchema.index({ eventId: 1 });
registrationSchema.index({ status: 1 });
registrationSchema.index({ paymentStatus: 1 });
registrationSchema.index({ registeredAt: -1 });
registrationSchema.index({ waitlistPosition: 1 });
registrationSchema.index({ 'attendeeInfo.email': 1 });

// Compound index to prevent duplicate registrations
registrationSchema.index(
  { userId: 1, eventId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $ne: 'cancelled' }
    }
  }
);

// Virtual for formatted total amount
registrationSchema.virtual('formattedTotalAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.totalAmount);
});

// Instance method to check if registration is paid
registrationSchema.methods.isPaid = function(): boolean {
  return this.paymentStatus === 'paid';
};

// Instance method to check if registration is cancelled
registrationSchema.methods.isCancelled = function(): boolean {
  return this.status === 'cancelled';
};

// Instance method to check if registration is waitlisted
registrationSchema.methods.isWaitlisted = function(): boolean {
  return this.status === 'waitlisted';
};

// Instance method to get formatted amount
registrationSchema.methods.getFormattedAmount = function(): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.totalAmount);
};

// Pre-save middleware
registrationSchema.pre('save', function(next) {
  // Set cancelledAt when status changes to cancelled
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }

  // Clear waitlist position when status changes from waitlisted
  if (this.isModified('status') && this.status !== 'waitlisted' && this.waitlistPosition) {
    this.waitlistPosition = undefined;
  }

  next();
});

// Static method to find waitlisted registrations for an event
registrationSchema.statics.findWaitlistedByEvent = function(eventId: mongoose.Types.ObjectId) {
  return this.find({
    eventId,
    status: 'waitlisted'
  }).sort({ waitlistPosition: 1, registeredAt: 1 });
};

// Static method to count registrations by event and status
registrationSchema.statics.countByEventAndStatus = function(eventId: mongoose.Types.ObjectId, status?: string) {
  const query: any = { eventId };
  if (status) {
    query.status = status;
  }
  return this.countDocuments(query);
};

const Registration = mongoose.model<IRegistration>('Registration', registrationSchema);

export default Registration;