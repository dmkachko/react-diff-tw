import { cn } from '../utils/utils.ts';

export const DifflTw: React.FC<DifflTwProps> = ({className}) => {
    return (
        <div className={cn('', className)}>
            test component
        </div>
    );
};

type DifflTwProps = {
    className?: string;
}
