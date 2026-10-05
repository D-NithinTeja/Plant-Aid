import React from 'react';
import ExpandableProfileCard, { ExpandableCardProps } from './expandable-profile-card';

export default ExpandableProfileCard;
export { ExpandableProfileCard };
export type { ExpandableCardProps };

export function ExpandableProfileCardDemo() {
  return (
    <div className="flex w-full max-w-sm items-center justify-center p-4">
      <ExpandableProfileCard />
    </div>
  );
}
