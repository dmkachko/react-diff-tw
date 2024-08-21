import { cn } from '../utils/utils.ts';

export const DifflTw: React.FC<DifflTwProps> = ({className}) => {
    return (
        <div className={cn('bg-amber-50 text-2xl text-red-500', className)}>
            test component
        </div>
    );
};

type DifflTwProps = {
    className?: string;
}
