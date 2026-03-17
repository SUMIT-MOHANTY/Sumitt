import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Box, Button, FormControl, FormHelperText, FormLabel, Input, Select, VStack, Heading,
         Flex, IconButton, useToast, Text } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';

interface Location {
  id: number;
  name: string;
}

interface SlotFormData {
  slots: {
    location_id: number;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
  }[];
}

interface SlotFormProps {
  locations: Location[];
  onSubmit: (data: SlotFormData) => Promise<void>;
  isLoading: boolean;
}

const SlotForm: React.FC<SlotFormProps> = ({ locations, onSubmit, isLoading }) => {
  const toast = useToast();
  const { control, handleSubmit, formState: { errors }, reset } = useForm<SlotFormData>({
    defaultValues: {
      slots: [
        {
          location_id: 0,
          date: format(new Date(), 'yyyy-MM-dd'),
          start_time: '09:00',
          end_time: '17:00',
          capacity: 10
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'slots'
  });

  const addSlot = () => {
    append({
      location_id: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '09:00',
      end_time: '17:00',
      capacity: 10
    });
  };

  const handleFormSubmit = async (data: SlotFormData) => {
    try {
      await onSubmit(data);
      reset({
        slots: [
          {
            location_id: 0,
            date: format(new Date(), 'yyyy-MM-dd'),
            start_time: '09:00',
            end_time: '17:00',
            capacity: 10
          }
        ]
      });
      toast({
        title: 'Success',
        description: 'Slots created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create slots',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(handleFormSubmit)} w="100%">
      <VStack spacing={6} align="flex-start">
        <Heading size="md">Create Appointment Slots</Heading>

        {fields.map((field, index) => (
          <Box key={field.id} p={4} borderWidth="1px" borderRadius="lg" w="100%">
            <Flex justify="space-between" mb={4}>
              <Heading size="sm">Slot {index + 1}</Heading>
              {fields.length > 1 && (
                <IconButton
                  aria-label="Delete slot"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => remove(index)}
                />
              )}
            </Flex>

            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.slots?.[index]?.location_id}>
                <FormLabel>Location</FormLabel>
                <Controller
                  name={`slots.${index}.location_id`}
                  control={control}
                  rules={{
                    required: 'Location is required',
                    min: { value: 1, message: 'Please select a location' }
                  }}
                  render={({ field }) => (
                    <Select
                      placeholder="Select location"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    >
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>{location.name}</option>
                      ))}
                    </Select>
                  )}
                />
                {errors.slots?.[index]?.location_id && (
                  <FormHelperText color="red.500">
                    {errors.slots[index].location_id?.message}
                  </FormHelperText>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.slots?.[index]?.date}>
                <FormLabel>Date</FormLabel>
                <Controller
                  name={`slots.${index}.date`}
                  control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <Input type="date" {...field} />
                  )}
                />
                {errors.slots?.[index]?.date && (
                  <FormHelperText color="red.500">
                    {errors.slots[index].date?.message}
                  </FormHelperText>
                )}
              </FormControl>

              <Flex width="100%" gap={4}>
                <FormControl isInvalid={!!errors.slots?.[index]?.start_time}>
                  <FormLabel>Start Time</FormLabel>
                  <Controller
                    name={`slots.${index}.start_time`}
                    control={control}
                    rules={{ required: 'Start time is required' }}
                    render={({ field }) => (
                      <Input type="time" {...field} />
                    )}
                  />
                  {errors.slots?.[index]?.start_time && (
                    <FormHelperText color="red.500">
                      {errors.slots[index].start_time?.message}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.slots?.[index]?.end_time}>
                  <FormLabel>End Time</FormLabel>
                  <Controller
                    name={`slots.${index}.end_time`}
                    control={control}
                    rules={{ required: 'End time is required' }}
                    render={({ field }) => (
                      <Input type="time" {...field} />
                    )}
                  />
                  {errors.slots?.[index]?.end_time && (
                    <FormHelperText color="red.500">
                      {errors.slots[index].end_time?.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </Flex>

              <FormControl isInvalid={!!errors.slots?.[index]?.capacity}>
                <FormLabel>Capacity</FormLabel>
                <Controller
                  name={`slots.${index}.capacity`}
                  control={control}
                  rules={{
                    required: 'Capacity is required',
                    min: { value: 1, message: 'Capacity must be at least 1' },
                    valueAsNumber: true
                  }}
                  render={({ field }) => (
                    <Input type="number" min={1} {...field} />
                  )}
                />
                {errors.slots?.[index]?.capacity && (
                  <FormHelperText color="red.500">
                    {errors.slots[index].capacity?.message}
                  </FormHelperText>
                )}
              </FormControl>
            </VStack>
          </Box>
        ))}

        <Button
          leftIcon={<AddIcon />}
          onClick={addSlot}
          colorScheme="blue"
          variant="outline"
        >
          Add Another Slot
        </Button>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
          width="200px"
        >
          Create Slots
        </Button>
      </VStack>
    </Box>
  );
};

export default SlotForm;
