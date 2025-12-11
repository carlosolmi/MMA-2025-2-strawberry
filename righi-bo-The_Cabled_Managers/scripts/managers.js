class MainEntity {
    constructor(name, scene, startTime) {
        this.name = name;
        this.scene = scene;
        this.startTime = startTime;
        
        // seconds
        this.growthTime = 40;
        this.lifeTime = 100;
        this.deathTime = 30;
        
        this.branch = null;
        this.endEntity = null; // TriLeaf or TriStrawberry
        
        this.isAlive = true;
    }
    
    create() {
        // Override in subclasses
    }
        
    update(currentTime) {
        if (!this.isAlive) return;
        
        const elapsed = currentTime - this.startTime;
        let normilizedElapsedTime = 0; // 0-1 then 1 then 1-0
//      var correctedElapsedTime = 0;
        
        if (elapsed < this.growthTime) {
            normilizedElapsedTime = elapsed / this.growthTime;
        } else if (elapsed < this.growthTime + this.lifeTime) {
            normilizedElapsedTime = 1;
        } else if (elapsed < this.growthTime + this.lifeTime + this.deathTime) {
            const deathElapsed = elapsed - (this.growthTime + this.lifeTime);
            normilizedElapsedTime = 1 - (deathElapsed / this.deathTime);
        } else {
            this.destroy();
            return;
        }
        
        if (this.branch) {
            this.branch.updatePosition(this.branch.parentOffset, this.branch.parentDirection);
            this.branch.update(normilizedElapsedTime);
        }

        /*if (this.endEntity && this.branch) {
            this.endEntity.updateGrowth(currentTime, normilizedElapsedTime);
            this.branch.updateGrowth(currentTime, normilizedElapsedTime);
            this.branch.updatePosition(this.branch.parentOffset, this.branch.parentDirection);
        }*/
    }
    
    destroy() {
        this.isAlive = false;
        if (this.endEntity) {
            this.endEntity.destroy();
        }
        if (this.branch) {
            this.branch.destroy();
        }
    }
}

// Main Branch with TriLeaf
class MainBranch extends MainEntity {
    constructor(name, scene, startTime, rotationAngle) {
        super(name, scene, startTime);
        this.rotationAngle = rotationAngle;
    }
    
    create() {
        this.branch = new Branch(this.name + "_branch", this.scene, 1, this.rotationAngle);
        this.branch.create();
        
        this.endEntity = new TriLeaf(this.name + "_trileaf", this.scene);
        this.endEntity.create();
        
        this.branch.child = this.endEntity;
        this.branch.updatePosition(this.branch.parentOffset, this.branch.parentDirection);
        this.endEntity.updatePosition(this.endEntity.parentOffset, this.endEntity.parentDirection);
    }
}

// Main Strawberry Branch with TriStrawberry
class MainStrawberryBranch extends MainEntity {
    constructor(name, scene, startTime, rotationAngle) {
        super(name, scene, startTime);
        this.rotationAngle = rotationAngle;
    }
    
    create() {
        this.branch = new Branch(this.name + "_branch", this.scene, 1, this.rotationAngle);
        this.branch.create();
        
        this.endEntity = new TriStrowberry(this.name + "_tristrawberry", this.scene);
        this.endEntity.create();
        
        this.branch.child = this.endEntity;
        this.branch.updatePosition(this.branch.parentOffset, this.branch.parentDirection);
        this.endEntity.updatePosition(this.endEntity.parentOffset, this.endEntity.parentDirection);
    }
}