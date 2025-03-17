import { Router, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middlewares/authenticateUser';

// Define the extended request interface
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    emailVerified?: boolean;
  };
}

const router = Router();
const prisma = new PrismaClient();

// Get all resources
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    
    // Use a simpler query approach
    const query = `
      SELECT 
        r.id, 
        r.title, 
        r.description, 
        r.url, 
        r."groupId",
        r."createdAt",
        u.id as "addedById", 
        u.name as "addedBy"
      FROM resource r
      JOIN "user" u ON r."addedById" = u.id
      JOIN group_member gm ON r."groupId" = gm."groupId"
      WHERE gm."userId" = $1
      ORDER BY r."createdAt" DESC
    `;
    
    const resources = await prisma.$queryRawUnsafe(query, userId);
    
    // Transform the data to match the frontend expectations
    const transformedResources = Array.isArray(resources) ? resources.map(resource => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      url: resource.url,
      addedBy: resource.addedBy,
      addedById: resource.addedById,
      groupId: resource.groupId,
      createdAt: new Date(resource.createdAt).toISOString(),
    })) : [];

    res.json(transformedResources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
});

// Get a specific resource by ID
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const query = `
      SELECT 
        r.id, 
        r.title, 
        r.description, 
        r.url, 
        r."groupId",
        r."createdAt",
        u.id as "addedById", 
        u.name as "addedBy",
        (
          SELECT COUNT(*) 
          FROM group_member 
          WHERE "groupId" = r."groupId" AND "userId" = $1
        ) as is_member
      FROM resource r
      JOIN "user" u ON r."addedById" = u.id
      WHERE r.id = $2
    `;
    
    const resources = await prisma.$queryRawUnsafe(query, userId, parseInt(id));
    
    if (!Array.isArray(resources) || resources.length === 0) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    const resourceData = resources[0];

    // Check if user is a member of the group
    if (parseInt(resourceData.is_member) === 0) {
      res.status(403).json({ message: 'You do not have access to this resource' });
      return;
    }

    // Transform the data to match the frontend expectations
    const transformedResource = {
      id: resourceData.id,
      title: resourceData.title,
      description: resourceData.description,
      url: resourceData.url,
      addedBy: resourceData.addedBy,
      addedById: resourceData.addedById,
      groupId: resourceData.groupId,
      createdAt: new Date(resourceData.createdAt).toISOString(),
    };

    res.json(transformedResource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ message: 'Failed to fetch resource' });
  }
});

// Create a new resource
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, url, groupId } = req.body;
    const userId = req.user?.id;

    if (!title || !url || !groupId) {
      res.status(400).json({ message: 'Title, URL, and group ID are required' });
      return;
    }

    // Check if user is a member of the group
    const checkQuery = `
      SELECT * FROM group_member 
      WHERE "userId" = $1 AND "groupId" = $2
    `;
    
    const groupMembers = await prisma.$queryRawUnsafe(checkQuery, userId, groupId);
    
    if (!Array.isArray(groupMembers) || groupMembers.length === 0) {
      res.status(403).json({ message: 'You are not a member of this group' });
      return;
    }

    // Create the resource
    const insertQuery = `
      INSERT INTO resource (title, description, url, "groupId", "addedById", "createdAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;
    
    await prisma.$executeRawUnsafe(insertQuery, title, description || null, url, groupId, userId);

    // Get the created resource
    const getQuery = `
      SELECT 
        r.id, 
        r.title, 
        r.description, 
        r.url, 
        r."groupId",
        r."createdAt",
        u.id as "addedById", 
        u.name as "addedBy"
      FROM resource r
      JOIN "user" u ON r."addedById" = u.id
      WHERE r.id = (SELECT MAX(id) FROM resource WHERE "addedById" = $1)
    `;
    
    const createdResources = await prisma.$queryRawUnsafe(getQuery, userId);
    
    if (!Array.isArray(createdResources) || createdResources.length === 0) {
      res.status(500).json({ message: 'Failed to retrieve created resource' });
      return;
    }

    const resourceData = createdResources[0];

    // Transform the data to match the frontend expectations
    const transformedResource = {
      id: resourceData.id,
      title: resourceData.title,
      description: resourceData.description,
      url: resourceData.url,
      addedBy: resourceData.addedBy,
      addedById: resourceData.addedById,
      groupId: resourceData.groupId,
      createdAt: new Date(resourceData.createdAt).toISOString(),
    };

    res.status(201).json(transformedResource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Failed to create resource' });
  }
});

// Update a resource
router.put('/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, url } = req.body;
    const userId = req.user?.id;

    // Check if resource exists and user has permission to update it
    const checkQuery = `
      SELECT 
        r.id, 
        r."addedById",
        r.title as current_title,
        r.description as current_description,
        r.url as current_url,
        (
          SELECT COUNT(*) 
          FROM group_member 
          WHERE "groupId" = r."groupId" AND "userId" = $1 AND role = 'ADMIN'
        ) as is_admin
      FROM resource r
      WHERE r.id = $2
    `;
    
    const existingResources = await prisma.$queryRawUnsafe(checkQuery, userId, parseInt(id));
    
    if (!Array.isArray(existingResources) || existingResources.length === 0) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    const resourceData = existingResources[0];

    // Check if user is the creator or an admin of the group
    if (resourceData.addedById !== userId && parseInt(resourceData.is_admin) === 0) {
      res.status(403).json({ message: 'You do not have permission to update this resource' });
      return;
    }

    // Update the resource
    const updateQuery = `
      UPDATE resource
      SET 
        title = $1,
        description = $2,
        url = $3,
        "updatedAt" = NOW()
      WHERE id = $4
    `;
    
    await prisma.$executeRawUnsafe(
      updateQuery, 
      title || resourceData.current_title,
      description !== undefined ? description : resourceData.current_description,
      url || resourceData.current_url,
      parseInt(id)
    );

    // Get the updated resource
    const getQuery = `
      SELECT 
        r.id, 
        r.title, 
        r.description, 
        r.url, 
        r."groupId",
        r."createdAt",
        u.id as "addedById", 
        u.name as "addedBy"
      FROM resource r
      JOIN "user" u ON r."addedById" = u.id
      WHERE r.id = $1
    `;
    
    const updatedResources = await prisma.$queryRawUnsafe(getQuery, parseInt(id));
    
    if (!Array.isArray(updatedResources) || updatedResources.length === 0) {
      res.status(500).json({ message: 'Failed to retrieve updated resource' });
      return;
    }

    const updatedResourceData = updatedResources[0];

    // Transform the data to match the frontend expectations
    const transformedResource = {
      id: updatedResourceData.id,
      title: updatedResourceData.title,
      description: updatedResourceData.description,
      url: updatedResourceData.url,
      addedBy: updatedResourceData.addedBy,
      addedById: updatedResourceData.addedById,
      groupId: updatedResourceData.groupId,
      createdAt: new Date(updatedResourceData.createdAt).toISOString(),
    };

    res.json(transformedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Failed to update resource' });
  }
});

// Delete a resource
router.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if resource exists and user has permission to delete it
    const checkQuery = `
      SELECT 
        r.id, 
        r."addedById",
        (
          SELECT COUNT(*) 
          FROM group_member 
          WHERE "groupId" = r."groupId" AND "userId" = $1 AND role = 'ADMIN'
        ) as is_admin
      FROM resource r
      WHERE r.id = $2
    `;
    
    const existingResources = await prisma.$queryRawUnsafe(checkQuery, userId, parseInt(id));
    
    if (!Array.isArray(existingResources) || existingResources.length === 0) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    const resourceData = existingResources[0];

    // Check if user is the creator or an admin of the group
    if (resourceData.addedById !== userId && parseInt(resourceData.is_admin) === 0) {
      res.status(403).json({ message: 'You do not have permission to delete this resource' });
      return;
    }

    // Delete the resource
    const deleteQuery = `
      DELETE FROM resource
      WHERE id = $1
    `;
    
    await prisma.$executeRawUnsafe(deleteQuery, parseInt(id));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Failed to delete resource' });
  }
});

export default router; 