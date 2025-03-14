import pygame
import random
from ant import Ant
from sprite import sprites
from map import Map, TileKind
from sprite import Sprite


# * Initialize Pygame
pygame.init()
pygame.display.set_caption("Ant Simulation")
screen = pygame.display.set_mode((800, 600))
clear_color = (30, 150, 50)
running = True

tile_kinds = [
  TileKind("grass", (34, 139, 34), True),
  TileKind("water", (0, 105, 148), False), 
  TileKind("dirt", (139, 69, 19), True),
]

map = Map("./maps/start.map", tile_kinds, 40)
mushroom = Sprite("./images/mushroom.png", 10 * map.tile_size, 10 * map.tile_size)
mushroom = Sprite("./images/mushroom.png", 6 * map.tile_size, 5 * map.tile_size)
ant = Ant("./images/ant.png", 5 * map.tile_size, 10 * map.tile_size)


# * Simulation loop
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    ant.move()
       
    # Draw the background
    screen.fill(clear_color)
    
    # Draw the map
    map.draw(screen)
    
    # Draw the ant
    ant.draw(screen)
    
    
    for s in sprites:
        s.draw(screen)
    # Update the display
    pygame.display.flip()
    

pygame.quit()
    
            
            
            
            