import { clsx } from 'clsx';
import { Container } from './Container';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'medical' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  containerSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Section({ 
  children, 
  className, 
  background = 'white',
  padding = 'lg',
  containerSize = 'xl'
}: SectionProps) {
  return (
    <section
      className={clsx(
        {
          'bg-white': background === 'white',
          'bg-gray-50': background === 'gray',
          'bg-medical-600': background === 'medical',
          'bg-gradient-to-br from-medical-50 to-blue-50': background === 'gradient',
        },
        {
          'py-8': padding === 'sm',
          'py-12': padding === 'md',
          'py-16': padding === 'lg',
          'py-20': padding === 'xl',
        },
        className
      )}
    >
      <Container size={containerSize}>
        {children}
      </Container>
    </section>
  );
}