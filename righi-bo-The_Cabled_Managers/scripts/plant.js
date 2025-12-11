class Plant {
    constructor(scene, position = new BABYLON.Vector3(0, 0, 0)) {
        this.scene = scene;
        this.position = position;
        
        // spawn config
        this.minSpawnInterval = 2; 
        this.maxSpawnInterval = 15; 
        this.nextSpawnTime = 0;
        
        // sun position
        this.sunAngle = 0;
        this.sunRadius = 2;
        this.sunPosition = new BABYLON.Vector3(0, 0, 0);
        this.sunOscillatingPosition = new BABYLON.Vector3(0, 0, 0);
        this.sunOscillationAngle = 0;
        this.oscillationPeriod = 5; // Time in seconds for one complete oscillation
        
        // branch management
        this.mainBranches = [];
        this.maxBranches = 100; 
        this.isFirstSpawn = true;
        this.spawnAngleTolerance = Math.PI / 12;
        
        this.sunVisualizer = null;
        this.createSunVisualizer();
        this.scheduleNextSpawn();
    }
    
    createSunVisualizer() {
        this.sunVisualizer = BABYLON.Mesh.CreateSphere("sunViz", 16, 0.2, this.scene);
        var material = new BABYLON.PBRMaterial("sunMat", this.scene);
        material.albedoColor = new BABYLON.Color3(1, 1, 0);
        material.emissiveColor = new BABYLON.Color3(1, 1, 0);
        this.sunVisualizer.material = material;
    }
    
    scheduleNextSpawn() {
        if (this.isFirstSpawn) {
            this.nextSpawnTime = 0;
            this.isFirstSpawn = false;
        } else {
            const randomInterval = this.minSpawnInterval + Math.random() * (this.maxSpawnInterval - this.minSpawnInterval);
            this.nextSpawnTime = performance.now() * 0.001 + randomInterval;
        }
    }
    
    updateSunPosition(currentTime) {
        // Calculate oscillating angle that goes from (sunAngle - π/2) to (sunAngle + π/2)
        const oscillationAmount = Math.sin(currentTime * 2 * Math.PI / this.oscillationPeriod) * (Math.PI / 2);
        this.sunOscillationAngle = this.sunAngle + oscillationAmount;
        
        // Use the oscillating angle for the actual sun position
        this.sunOscillatingPosition.x = this.position.x + Math.cos(this.sunOscillationAngle) * this.sunRadius;
        this.sunOscillatingPosition.z = this.position.z + Math.sin(this.sunOscillationAngle) * this.sunRadius;
        this.sunOscillatingPosition.y = this.position.y;
        
        this.sunVisualizer.position = this.sunOscillatingPosition;
    }
    
    isSpaceAvailable(angle) {
        const tolerance = 15 * (Math.PI / 180);
        
        for (let branch of this.mainBranches) {
            if (!branch.isAlive) continue;
            
            let angleDiff = Math.abs(branch.rotationAngle - angle);
            if (angleDiff > Math.PI) {
                angleDiff = 2 * Math.PI - angleDiff;
            }
            
            if (angleDiff < tolerance) {
                return false;
            }
        }
        return true;
    }
    
    instanceNewBranch(currentTime) {
        const aliveBranches = [];
        for (let branch of this.mainBranches) {
            if (branch.isAlive) {
                aliveBranches.push(branch);
            } else {
                branch.destroy();
            }
        }
        this.mainBranches = aliveBranches;
        
        if (this.mainBranches.length >= this.maxBranches) {
            return;
        }

        if (!this.isSpaceAvailable(this.sunAngle)) {
            this.scheduleNextSpawn();
            return;
        }

        let isMainBranch;
        if (this.mainBranches.length === 0) {
            isMainBranch = true;
        } else {
            const rand = Math.random();
            isMainBranch = rand < 0.8;
        }
        
        const branchName = isMainBranch ? 
            "mainBranch_" + this.mainBranches.length : 
            "mainStrawberry_" + this.mainBranches.length;
        
        let newBranch;
        if (isMainBranch) {
            newBranch = new MainBranch(branchName, this.scene, currentTime, this.sunOscillationAngle);
        } else {
            newBranch = new MainStrawberryBranch(branchName, this.scene, currentTime, this.sunOscillationAngle);
        }
        
        newBranch.create();
        this.mainBranches.push(newBranch);
    }
    
    update() {
        const currentTime = performance.now() * 0.001;
        
        this.updateSunPosition(currentTime);

        if (currentTime >= this.nextSpawnTime) {
            this.instanceNewBranch(currentTime);
            this.scheduleNextSpawn();
        }

        for (let branch of this.mainBranches) {
            if (branch.isAlive) {
                branch.update(currentTime);
            }
        }
    }
}