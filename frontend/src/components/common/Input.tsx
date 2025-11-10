import React from 'react';
import { TextField } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface InputProps {
  label?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  name?: string;
  id?: string;
  autoComplete?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      type = 'text',
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      disabled = false,
      required = false,
      className,
      fullWidth = true,
      multiline = false,
      rows,
      name,
      id,
      autoComplete,
    },
    ref
  ) => {
    const getSxProps = (): SxProps<Theme> => ({
      '& .MuiOutlinedInput-root': {
        bgcolor: 'white',
        '& fieldset': {
          borderColor: '#D1D5DB',
        },
        '&:hover fieldset': {
          borderColor: '#9CA3AF',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#FF9900',
          borderWidth: 2,
        },
      },
      '& .MuiInputLabel-root': {
        color: '#374151',
        '&.Mui-focused': {
          color: '#FF9900',
        },
      },
      '& .MuiOutlinedInput-input': {
        color: '#111827',
      },
    });

    return (
      <TextField
        inputRef={ref}
        label={label}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        fullWidth={fullWidth}
        multiline={multiline}
        rows={rows}
        name={name}
        id={id}
        autoComplete={autoComplete}
        error={!!error}
        helperText={error}
        variant="outlined"
        size="medium"
        className={className}
        sx={getSxProps()}
      />
    );
  }
);

Input.displayName = 'Input';
