import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, VStack, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import SlotForm from '../../components/admin/SlotForm';
import { createSlot, SlotFormData } from '../../services/api/slotApi';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Location {
  id: number;
  name: string;
}

const SlotCreation: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // This would be replaced with an actual API call
        const response = await fetch('/api/locations');
        const data = await response.json();
        setLocations(data);
        setIsLoadingLocations(false);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('Failed to load locations. Please try again later.');
        setIsLoadingLocations(false);

        // For demo purposes, use sample locations
        setLocations([
          { id: 1, name: 'Downtown Office' },
          { id: 2, name: 'East Side Branch' },
          { id: 3, name: 'West End Location' },
        ]);
      }
    };

    fetchLocations();
  }, []);

  // Check if user is admin, otherwise redirect
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  const handleSubmit = async (formData: SlotFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Process each slot in the array
      for (const slot of formData.slots) {
        await createSlot(slot);
      }

      toast({
        title: 'Success',
        description: `${formData.slots.length} slot(s) created successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating slots');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create slots',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingLocations) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="flex-start" width="100%">
        <Heading>Slot Management</Heading>
        <Text>Create appointment slots for passport offices.</Text>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box width="100%">
          <SlotForm
            locations={locations}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </Box>
      </VStack>
    </Container>
  );
};

export default SlotCreation;
