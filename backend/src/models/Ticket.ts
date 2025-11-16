import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

// Ticket document interface
export interface ITicket extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  registrationId: mongoose.Types.ObjectId;
  ticketNumber: string;
  qrCode: string;
  type: 'standard' | 'vip' | 'early_bird';
  attendeeName: string;
  attendeeEmail: string;
  createdAt: Date;
  validUntil: Date;
  isUsed: boolean;
  usedAt?: Date;
  checkedInBy?: mongoose.Types.ObjectId;

  // Methods
  isValid(): boolean;
  isExpired(): boolean;
  generateQRCode(): string;
  getPublicData(): any;
}

const ticketSchema = new Schema<ITicket>({
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
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  qrCode: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['standard', 'vip', 'early_bird'],
    default: 'standard'
  },
  attendeeName: {
    type: String,
    required: [true, 'Attendee name is required'],
    trim: true,
    maxlength: [100, 'Attendee name cannot exceed 100 characters']
  },
  attendeeEmail: {
    type: String,
    required: [true, 'Attendee email is required'],
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  },
  checkedInBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ticketSchema.index({ userId: 1 });
ticketSchema.index({ eventId: 1 });
ticketSchema.index({ registrationId: 1 });
ticketSchema.index({ ticketNumber: 1 }, { unique: true });
ticketSchema.index({ isUsed: 1 });
ticketSchema.index({ validUntil: 1 });
ticketSchema.index({ createdAt: -1 });

// Compound index for unique tickets per registration
ticketSchema.index(
  { registrationId: 1, attendeeEmail: 1 },
  { unique: true }
);

// Pre-save middleware to generate ticket number and QR code
ticketSchema.pre('save', async function(next) {
  // Generate ticket number if it doesn't exist
  if (!this.ticketNumber) {
    this.ticketNumber = this.generateTicketNumber();
  }

  // Generate QR code if it doesn't exist
  if (!this.qrCode) {
    this.qrCode = this.generateQRCodeData();
  }

  next();
});

// Pre-save middleware to set usedAt when ticket is marked as used
ticketSchema.pre('save', function(next) {
  if (this.isModified('isUsed') && this.isUsed && !this.usedAt) {
    this.usedAt = new Date();
  }
  next();
});

// Static method to generate unique ticket number
ticketSchema.statics.generateUniqueTicketNumber = async function(): Promise<string> {
  let ticketNumber: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    ticketNumber = this.generateTicketNumber();
    const existingTicket = await this.findOne({ ticketNumber });
    if (!existingTicket) {
      isUnique = true;
    }
    attempts++;
  } while (!isUnique && attempts < maxAttempts);

  if (!isUnique) {
    throw new Error('Failed to generate unique ticket number after multiple attempts');
  }

  return ticketNumber;
};

// Static method to generate ticket number
ticketSchema.statics.generateTicketNumber = function(): string {
  const timestamp = Date.now().toString(36);
  const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TKT-${timestamp}-${randomString}`;
};

// Instance method to generate QR code data
ticketSchema.methods.generateQRCodeData = function(): string {
  const qrData = {
    ticketId: this._id.toString(),
    ticketNumber: this.ticketNumber,
    eventId: this.eventId.toString(),
    attendeeId: this.userId.toString(),
    attendeeEmail: this.attendeeEmail,
    timestamp: Date.now(),
    signature: this.generateSignature()
  };

  return JSON.stringify(qrData);
};

// Instance method to generate signature for QR code (anti-fraud)
ticketSchema.methods.generateSignature = function(): string {
  const data = `${this._id}${this.ticketNumber}${this.eventId}${this.attendeeEmail}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
};

// Instance method to check if ticket is valid
ticketSchema.methods.isValid = function(): boolean {
  return !this.isUsed && !this.isExpired();
};

// Instance method to check if ticket is expired
ticketSchema.methods.isExpired = function(): boolean {
  return new Date() > this.validUntil;
};

// Instance method to get public data
ticketSchema.methods.getPublicData = function() {
  return {
    _id: this._id,
    ticketNumber: this.ticketNumber,
    type: this.type,
    attendeeName: this.attendeeName,
    attendeeEmail: this.attendeeEmail,
    validUntil: this.validUntil,
    isUsed: this.isUsed,
    usedAt: this.usedAt,
    isValid: this.isValid(),
    isExpired: this.isExpired(),
    createdAt: this.createdAt
  };
};

// Static method to find active tickets for a user
ticketSchema.statics.findActiveByUser = function(userId: mongoose.Types.ObjectId) {
  return this.find({
    userId,
    isUsed: false,
    validUntil: { $gt: new Date() }
  }).populate('eventId', 'title startDate endDate location').sort({ createdAt: -1 });
};

// Static method to find used tickets for an event
ticketSchema.statics.findUsedByEvent = function(eventId: mongoose.Types.ObjectId) {
  return this.find({
    eventId,
    isUsed: true
  }).populate('checkedInBy', 'firstName lastName').sort({ usedAt: -1 });
};

// Static method to validate QR code data
ticketSchema.statics.validateQRCode = function(qrData: string): any {
  try {
    const parsed = JSON.parse(qrData);

    // Basic validation
    if (!parsed.ticketId || !parsed.ticketNumber || !parsed.signature) {
      throw new Error('Invalid QR code format');
    }

    return parsed;
  } catch (error) {
    throw new Error('Invalid QR code data');
  }
};

const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);

export default Ticket;