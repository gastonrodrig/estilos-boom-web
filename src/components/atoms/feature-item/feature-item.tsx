import { LucideIcon } from 'lucide-react';

interface IFeatureItemProps {
  icon: LucideIcon;
  description: string;
}

export const FeatureItem: React.FC<IFeatureItemProps> = ({
  icon: Icon,
  description,
}) => {
  return (
    <div className="grid grid-cols-[24px_1fr] items-center gap-3 lg:grid-cols-[32px_1fr]">
      <Icon className="h-6 w-6 text-pink-900 lg:h-8 lg:w-8" />
      <p className="font-light text-base leading-none">
        {description}
      </p>
    </div>
  );
};
