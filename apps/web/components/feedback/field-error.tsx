interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className="text-sm font-medium text-destructive mt-1.5">
      {message}
    </p>
  );
}
