import pygame

sprites = []
loaded = {}

class Sprite:
    def __init__(self, image, x, y):
        self.x = x
        self.y = y
        self.image = pygame.image.load(image) if isinstance(image, str) else image
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
        sprites.append(self)
        
    def delete(self):
      sprites.remove(self)
      
    def draw(self, screen):
        screen.blit(self.image, self.rect)
      
    
    
        
        
        
        
        
        
        
        
        
        