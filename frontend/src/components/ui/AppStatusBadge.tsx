import React from 'react';
import { AppBadge } from './AppBadge';

interface AppStatusBadgeProps {
  status: string;
}

export const AppStatusBadge: React.FC<AppStatusBadgeProps> = ({ status }) => {
  const upper = status.toUpperCase();

  switch (upper) {
    case 'ACTIVE':
    case 'CONFIRMED':
    case 'IN_STOCK':
      return <AppBadge variant="emerald">{status}</AppBadge>;

    case 'LEAD':
    case 'DRAFT':
    case 'PENDING':
      return <AppBadge variant="amber">{status}</AppBadge>;

    case 'INACTIVE':
    case 'CANCELLED':
    case 'OUT_OF_STOCK':
      return <AppBadge variant="rose">{status}</AppBadge>;

    case 'RETAIL':
      return <AppBadge variant="purple">Retail</AppBadge>;

    case 'WHOLESALE':
      return <AppBadge variant="blue">Wholesale</AppBadge>;

    case 'DISTRIBUTOR':
      return <AppBadge variant="indigo">Distributor</AppBadge>;

    default:
      return <AppBadge variant="slate">{status}</AppBadge>;
  }
};
