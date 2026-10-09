import React, { useRef, useEffect, TextareaHTMLAttributes } from 'react';

interface AutoResizeTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
}

export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  onChange,
  minRows = 2,
  maxRows = 10,
  className = '',
  placeholder,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to compute actual scrollHeight accurately
    textarea.style.height = 'auto';
    const computedLineHeight = 20; // fallback approx line-height
    const minH = minRows * computedLineHeight + 16;
    const maxH = maxRows * computedLineHeight + 16;

    const newHeight = Math.min(Math.max(textarea.scrollHeight, minH), maxH);
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    if (onChange) onChange(e);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full resize-none transition-all duration-100 ease-out outline-none ${className}`}
      {...props}
    />
  );
};
