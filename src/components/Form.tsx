import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  useColorModeValue,
} from '@chakra-ui/react';
import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  isTextarea?: boolean;
  isCheckbox?: boolean;
  isRadio?: boolean;
  isSwitch?: boolean;
  radioOptions?: { value: string; label: string }[];
  radioValue?: string;
  radioOnChange?: (value: string) => void;
  radioDirection?: 'horizontal' | 'vertical';
}

export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  options,
  min,
  max,
  step,
  isTextarea = false,
  isCheckbox = false,
  isRadio = false,
  isSwitch = false,
  radioOptions,
  radioValue,
  radioOnChange,
  radioDirection = 'vertical',
}: FormFieldProps) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const renderField = () => {
    if (isTextarea) {
      return (
        <Textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          bg={bgColor}
          borderColor={borderColor}
          _hover={{ borderColor: 'blue.400' }}
          _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
        />
      );
    }

    if (isCheckbox) {
      return (
        <Checkbox
          name={name}
          isChecked={value}
          onChange={(e) => onChange(e.target.checked)}
          colorScheme="blue"
        >
          {label}
        </Checkbox>
      );
    }

    if (isRadio && radioOptions && radioValue && radioOnChange) {
      return (
        <RadioGroup value={radioValue} onChange={radioOnChange}>
          <Stack direction={radioDirection === 'horizontal' ? 'row' : 'column'}>
            {radioOptions.map((option) => (
              <Radio key={option.value} value={option.value} colorScheme="blue">
                {option.label}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      );
    }

    if (isSwitch) {
      return (
        <Switch
          name={name}
          isChecked={value}
          onChange={(e) => onChange(e.target.checked)}
          colorScheme="blue"
        />
      );
    }

    if (type === 'number') {
      return (
        <NumberInput
          name={name}
          value={value}
          onChange={(_, value) => onChange(value)}
          min={min}
          max={max}
          step={step}
        >
          <NumberInputField
            placeholder={placeholder}
            bg={bgColor}
            borderColor={borderColor}
            _hover={{ borderColor: 'blue.400' }}
            _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
          />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      );
    }

    if (type === 'select' && options) {
      return (
        <Select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          bg={bgColor}
          borderColor={borderColor}
          _hover={{ borderColor: 'blue.400' }}
          _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    }

    return (
      <Input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        bg={bgColor}
        borderColor={borderColor}
        _hover={{ borderColor: 'blue.400' }}
        _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
      />
    );
  };

  if (isCheckbox || isRadio || isSwitch) {
    return (
      <FormControl isInvalid={!!error}>
        {renderField()}
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    );
  }

  return (
    <FormControl isRequired={required} isInvalid={!!error}>
      <FormLabel>{label}</FormLabel>
      {renderField()}
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  submitText?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export const Form = ({
  onSubmit,
  children,
  submitText = 'Soumettre',
  isLoading = false,
  isDisabled = false,
}: FormProps) => {
  return (
    <Box as="form" onSubmit={onSubmit} width="100%">
      <VStack spacing={4} align="stretch">
        {children}
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
          isDisabled={isDisabled}
          width="100%"
        >
          {submitText}
        </Button>
      </VStack>
    </Box>
  );
}; 