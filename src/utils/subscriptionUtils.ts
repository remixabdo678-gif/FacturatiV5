export interface SubscriptionStatus {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number;
  shouldBlockUsers: boolean;
  shouldShowNotification: boolean;
}

export function calculateSubscriptionStatus(
  subscription: string | undefined,
  expiryDate: string | undefined
): SubscriptionStatus {
  // Si ce n'est pas un abonnement Pro, pas de restrictions
  if (subscription !== 'pro' || !expiryDate) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysRemaining: 0,
      shouldBlockUsers: false,
      shouldShowNotification: false
    };
  }

  const currentDate = new Date();
  const expiry = new Date(expiryDate);
  const timeDiff = expiry.getTime() - currentDate.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 5;
  const shouldBlockUsers = isExpired;
  const shouldShowNotification = isExpiringSoon && !isExpired;

  return {
    isExpired,
    isExpiringSoon,
    daysRemaining: Math.max(0, daysRemaining),
    shouldBlockUsers,
    shouldShowNotification
  };
}

export function formatExpiryMessage(daysRemaining: number): string {
  if (daysRemaining === 0) {
    return "Votre abonnement expire aujourd'hui !";
  } else if (daysRemaining === 1) {
    return "Votre abonnement expire demain !";
  } else {
    return `Il reste ${daysRemaining} jours avant l'expiration de votre abonnement.`;
  }
}

export function shouldShowExpirationWarning(
  subscription: string | undefined,
  expiryDate: string | undefined,
  lastWarningDismissed?: string
): boolean {
  const status = calculateSubscriptionStatus(subscription, expiryDate);
  
  if (!status.shouldShowNotification) {
    return false;
  }

  // Vérifier si l'avertissement a été masqué récemment (moins de 24h)
  if (lastWarningDismissed) {
    const dismissedDate = new Date(lastWarningDismissed);
    const now = new Date();
    const hoursDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      return false;
    }
  }

  return true;
}