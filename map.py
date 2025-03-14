import pygame

class TileKind:
    # TODO Change color to image later
    def __init__(self, name, color, walkable):
        self.name = name
        self.color = color
        self.walkable = walkable

class Map:
    def __init__(self, map_file, tile_kinds, tile_size):
        self.tile_kinds = tile_kinds
                
        # Load map from file
        file = open(map_file, "r")
        data = file.read()
        file.close()
        
        # Set up the tiles from loaded data
        self.tiles = []
        for line in data.split("\n"):
            row = []
            for tile_number in line:
                row.append(int(tile_number))
            self.tiles.append(row)
        
        self.tile_size = tile_size
        
    def draw(self, screen):
      for y, row in enumerate(self.tiles):
        for x, tile_number in enumerate(row):
          location = (x * self.tile_size, y * self.tile_size)
          color = self.tile_kinds[tile_number].color
          pygame.draw.rect(screen, color, (location, (self.tile_size, self.tile_size)))
