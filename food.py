
class Food:
    def __init__(self, id):
        self.id = id
        self.x = 0
        self.y = 0
        self.energy = 10
    
    def spawnFood(self, x, y, energy):
        self.x = x
        self.y = y
        self.energy = energy
        
    def removeFood(self):
        self.x = 0
        self.y = 0
        self.energy = 0
        
    # * Getters
    def get_x(self):
        return self.x
    
    def get_y(self):
        return self.y
  
    def get_energy(self):
        return self.energy
    
    def get_id(self):
        return self.id
    
    
