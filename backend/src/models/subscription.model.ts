import mongoose, { Document, Schema } from 'mongoose';

export interface SubscriptionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  plan: 'MONTHLY' | 'LIFETIME';
  status: 'active' | 'cancelled' | 'expired';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodEnd?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive(): boolean;
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ['MONTHLY', 'LIFETIME'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    currentPeriodEnd: {
      type: Date,
      sparse: true,
    },
    cancelledAt: {
      type: Date,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.methods.isActive = function (this: SubscriptionDocument): boolean {
  if (this.plan === 'LIFETIME' && this.status === 'active') {
    return true;
  }
  
  if (this.plan === 'MONTHLY' && this.status === 'active' && this.currentPeriodEnd) {
    return this.currentPeriodEnd > new Date();
  }
  
  return false;
};

const SubscriptionModel = mongoose.model<SubscriptionDocument>('Subscription', subscriptionSchema);
export default SubscriptionModel;
