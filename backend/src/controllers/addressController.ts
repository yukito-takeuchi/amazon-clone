import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AddressModel } from '../models/Address';

/**
 * Get all addresses for current user
 */
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const addresses = await AddressModel.findByUserId(req.user.id);

    res.json({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Failed to get addresses' });
  }
};

/**
 * Create new address
 */
export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { postalCode, prefecture, city, addressLine, building, phoneNumber, isDefault } = req.body;

    const address = await AddressModel.create({
      userId: req.user.id,
      postalCode,
      prefecture,
      city,
      addressLine,
      building,
      phoneNumber,
      isDefault,
    });

    res.status(201).json({
      message: 'Address created successfully',
      address,
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
};

/**
 * Update address
 */
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { postalCode, prefecture, city, addressLine, building, phoneNumber, isDefault } = req.body;

    const address = await AddressModel.update(parseInt(id), req.user.id, {
      postalCode,
      prefecture,
      city,
      addressLine,
      building,
      phoneNumber,
      isDefault,
    });

    if (!address) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    res.json({
      message: 'Address updated successfully',
      address,
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
};

/**
 * Delete address
 */
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const deleted = await AddressModel.delete(parseInt(id), req.user.id);

    if (!deleted) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
};
