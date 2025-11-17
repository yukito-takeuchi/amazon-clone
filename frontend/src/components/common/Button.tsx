import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
  form?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  onClick,
  type = 'button',
  fullWidth = false,
  form,
}) => {
  // Map custom variants to MUI variants and colors
  const getMuiVariant = (): 'contained' | 'outlined' | 'text' => {
    if (variant === 'outline') return 'outlined';
    return 'contained';
  };

  // Map sizes to MUI sizes
  const getMuiSize = (): 'small' | 'medium' | 'large' => {
    if (size === 'sm') return 'small';
    if (size === 'lg') return 'large';
    return 'medium';
  };

  // Custom styling based on variant
  const getSxProps = (): SxProps<Theme> => {
    const baseStyles: SxProps<Theme> = {
      textTransform: 'none',
      fontWeight: 500,
      transition: 'all 0.2s',
    };

    if (variant === 'primary') {
      return {
        ...baseStyles,
        bgcolor: '#FF9900',
        color: 'white',
        '&:hover': {
          bgcolor: '#FA8900',
        },
        '&:disabled': {
          bgcolor: '#FF9900',
          opacity: 0.5,
        },
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseStyles,
        bgcolor: '#E5E7EB',
        color: '#111827',
        '&:hover': {
          bgcolor: '#D1D5DB',
        },
      };
    }

    if (variant === 'outline') {
      return {
        ...baseStyles,
        borderColor: '#D1D5DB',
        color: '#374151',
        '&:hover': {
          bgcolor: '#F9FAFB',
          borderColor: '#D1D5DB',
        },
      };
    }

    return baseStyles;
  };

  return (
    <MuiButton
      variant={getMuiVariant()}
      size={getMuiSize()}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
      fullWidth={fullWidth}
      className={className}
      form={form}
      sx={getSxProps()}
      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
    >
      {isLoading ? '処理中...' : children}
    </MuiButton>
  );
};
