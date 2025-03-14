import numpy as np
from sprite import Sprite
import pygame

class Ant(Sprite):
    def __init__(self, image, x, y):
        super().__init__(image, x, y)
        # Scale the image to a smaller size (e.g., 20x20 pixels)
        self.image = pygame.transform.scale(self.image, (30, 30))
        # Update the rectangle to match the new image size
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
        self.id = id
        self.parent_id = None
        self.children_ids = []
        self.energy = 100
        self.age = 0
        self.food = 0
        self.movement_speed = 1
        self.state = "idle"
        self.vision = 10
        
    
    def move(self):
        # Initialize direction and state if not exists
        if not hasattr(self, 'current_direction'):
            self.current_direction = np.random.uniform(0, 2 * np.pi)
            self.direction_change_counter = 0
            self.state = 'exploring'  # or 'returning'
        
        # Check for pheromones in vision radius
        pheromone_direction = self.detect_pheromones()  # You'll need to implement this
        
        if pheromone_direction is not None:
            # Follow pheromone trail with some randomness
            self.current_direction = pheromone_direction + np.random.uniform(-np.pi/6, np.pi/6)
        elif self.direction_change_counter >= 20 or np.random.random() < 0.1:
            # Change direction by a small random angle
            self.current_direction += np.random.uniform(-np.pi/4, np.pi/4)
            self.direction_change_counter = 0
        
        # Calculate movement vector
        dx = self.movement_speed * np.cos(self.current_direction)
        dy = self.movement_speed * np.sin(self.current_direction)
        
        # Add small random perturbation
        dx += np.random.uniform(-0.2, 0.2)
        dy += np.random.uniform(-0.2, 0.2)
        
        # Update position with boundary checking
        new_x = self.x + dx
        new_y = self.y + dy
        
        # Assuming screen boundaries are defined
        screen_width = 800  # Get from your simulation
        screen_height = 600  # Get from your simulation
        
        # Bounce off boundaries
        if 0 <= new_x <= screen_width:
            self.x = new_x
            self.rect.x = new_x
        else:
            self.current_direction = np.pi - self.current_direction  # Reverse x direction
        
        if 0 <= new_y <= screen_height:
            self.y = new_y
            self.rect.y = new_y
        else:
            self.current_direction = -self.current_direction  # Reverse y direction
        
        # Leave pheromone trail
        self.leave_pheromone()  # You'll need to implement this
        
        self.direction_change_counter += 1
        self.energy -= 1
    
    def eat(self):
        self.energy += 10
    
    def reproduce(self):
        self.energy -= 10
        return Ant( parent_id=self.id)
    
    def age(self):
        self.age += 1
    
    def die(self):
        self.energy = 0
        self.age = 0
    
    
    # * Getters
    def get_energy(self):
        return self.energy
    
    def get_age(self):
        return self.age
    
    def get_food(self):
        return self.food
    
    def get_speed(self):
        return self.movement_speed
    
    def get_vision(self):
        return self.vision
    
    def get_id(self):
        return self.id
    
    # * Setters
    def set_energy(self, energy):
        self.energy = energy
    
    def set_age(self, age):
        self.age = age
    
    def set_food(self, food):
        self.food = food
    
    def set_speed(self, speed):
        self.movement_speed = speed
    
    def set_vision(self, vision):
        self.vision = vision
    
    def set_id(self, id):
        self.id = id
    
    def detect_pheromones(self):
        """
        Detect pheromones in the ant's vision radius.
        Returns the direction to the strongest pheromone or None if no pheromones detected.
        """
        # For now, return None since we haven't implemented pheromone detection yet
        # This will make the ant move randomly until we implement pheromone detection
        return None
    
    def leave_pheromone(self):
        """
        Leave a pheromone trail at the current position.
        """
        # For now, do nothing since we haven't implemented pheromone system yet
        pass
    
