import mongoose, { Schema, Document } from 'mongoose';

// Location interface
export interface ILocation {
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Event settings interface
export interface IEventSettings {
  allowWaitlist: boolean;
  requireApproval: boolean;
  sendReminders: boolean;
}

// Event document interface
export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  organizerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  eventType: 'in-person' | 'virtual' | 'hybrid';
  location?: ILocation;
  virtualLink?: string;
  startDate: Date;
  endDate: Date;
  maxAttendees?: number;
  currentAttendees: number;
  price: number;
  currency: string;
  coverImage?: string;
  images: string[];
  tags: string[];
  isPublic: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  settings: IEventSettings;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  isFree(): boolean;
  isSoldOut(): boolean;
  getSpotsLeft(): number;
  isRegistrationOpen(): boolean;
  getPublicData(): any;
}

const coordinatesSchema = new Schema({
  lat: {
    type: Number,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    min: -180,
    max: 180
  }
}, { _id: false });

const locationSchema = new Schema<ILocation>({
  venue: {
    type: String,
    trim: true,
    maxlength: [200, 'Venue name cannot exceed 200 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  coordinates: {
    type: coordinatesSchema,
    default: null
  }
}, { _id: false });

const settingsSchema = new Schema<IEventSettings>({
  allowWaitlist: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: false
  },
  sendReminders: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const eventSchema = new Schema<IEvent>({
  organizerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer ID is required']
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    minlength: [50, 'Description must be at least 50 characters long'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    trim: true,
    enum: [
      'business',
      'technology',
      'education',
      'entertainment',
      'sports',
      'music',
      'food',
      'art',
      'health',
      'charity',
      'networking',
      'workshop',
      'conference',
      'meetup',
      'other'
    ]
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: {
      values: ['in-person', 'virtual', 'hybrid'],
      message: 'Event type must be one of: in-person, virtual, hybrid'
    }
  },
  location: {
    type: locationSchema,
    default: null,
    validate: {
      validator: function(this: IEvent, value: ILocation) {
        // Location is required for in-person events
        if (this.eventType === 'in-person') {
          return value && (value.venue || value.address);
        }
        return true;
      },
      message: 'Location details are required for in-person events'
    }
  },
  virtualLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(this: IEvent, value: string) {
        // Virtual link is required for virtual events
        if (this.eventType === 'virtual') {
          return value && value.length > 0;
        }
        return true;
      },
      message: 'Virtual link is required for virtual events'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Start date must be in the future'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: IEvent, value: Date) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  maxAttendees: {
    type: Number,
    min: [1, 'Max attendees must be at least 1'],
    max: [100000, 'Max attendees cannot exceed 100,000']
  },
  currentAttendees: {
    type: Number,
    default: 0,
    min: [0, 'Current attendees cannot be negative']
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative'],
    max: [999999.99, 'Price cannot exceed 999,999.99']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']
  },
  coverImage: {
    type: String,
    default: null
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(images: string[]) {
        return images.length <= 10; // Maximum 10 images
      },
      message: 'Cannot have more than 10 images'
    }
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 10; // Maximum 10 tags
      },
      message: 'Cannot have more than 10 tags'
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  settings: {
    type: settingsSchema,
    default: () => ({})
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
eventSchema.index({ organizerId: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ isPublic: 1 });
eventSchema.index({ featured: 1 });
eventSchema.index({ price: 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ 'location.country': 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ title: 'text', description: 'text' }); // Text search index

// Virtual for duration in hours
eventSchema.virtual('durationInHours').get(function() {
  return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60));
});

// Virtual for formatted price
eventSchema.virtual('formattedPrice').get(function() {
  if (this.price === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.price);
});

// Instance method to check if event is free
eventSchema.methods.isFree = function(): boolean {
  return this.price === 0;
};

// Instance method to check if event is sold out
eventSchema.methods.isSoldOut = function(): boolean {
  return this.maxAttendees !== undefined && this.currentAttendees >= this.maxAttendees;
};

// Instance method to get spots left
eventSchema.methods.getSpotsLeft = function(): number {
  if (!this.maxAttendees) return Infinity;
  return Math.max(0, this.maxAttendees - this.currentAttendees);
};

// Instance method to check if registration is open
eventSchema.methods.isRegistrationOpen = function(): boolean {
  const now = new Date();
  return (
    this.status === 'published' &&
    this.startDate > now &&
    !this.isSoldOut()
  );
};

// Instance method to get public data
eventSchema.methods.getPublicData = function() {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    category: this.category,
    eventType: this.eventType,
    location: this.location,
    virtualLink: this.eventType === 'virtual' || this.eventType === 'hybrid' ? this.virtualLink : undefined,
    startDate: this.startDate,
    endDate: this.endDate,
    maxAttendees: this.maxAttendees,
    currentAttendees: this.currentAttendees,
    price: this.price,
    currency: this.currency,
    formattedPrice: this.formattedPrice,
    coverImage: this.coverImage,
    images: this.images,
    tags: this.tags,
    isPublic: this.isPublic,
    status: this.status,
    featured: this.featured,
    settings: this.settings,
    durationInHours: this.durationInHours,
    isSoldOut: this.isSoldOut(),
    spotsLeft: this.getSpotsLeft(),
    isRegistrationOpen: this.isRegistrationOpen(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;