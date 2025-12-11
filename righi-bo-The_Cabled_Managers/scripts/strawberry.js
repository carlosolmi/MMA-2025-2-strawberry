class Strawberry {
    constructor(name, scene) {
        this.name = name;
        this.scene = scene;
        this.growth = null;
        this.parentOffset = new BABYLON.Vector3(0,0,0);
        this.parentDirection = null;
        this.postion = new BABYLON.Vector3(0,0,0);
        this.child = null;
        this.spline = null;

        this.startingPhi = 0;
        this.lifeSpan = 1000;

        this.stem = null;
        this.strawberry = null;
        this.flower = null;
        this.leafs = null;

        this.strawberry_target1 = null
        this.leaf_target1 = null
        this.leaf_target2 = null
        this.flower_target1 = null
        this.stem_target1 = null

        this.hasChagnedColor = false
        this.growthStartTime = 0;
    }
    
    create() {
        this.spawnStrawberryMesh("models/strawberry/", "models/strawberry/textures/");
        this.spawnStemMesh("models/strawberry/", "models/strawberry/textures/");
        this.spawnFlowerMesh("models/strawberry/", "models/strawberry/textures/");
        this.spawnLeafMesh("models/strawberry/", "models/strawberry/textures/");
    }

    alignStrawberryObjectWithTangent() {
        var localUp = BABYLON.Vector3.Up();
        var targetDirection = this.parentDirection;
        
        this.stem.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
            localUp,
            targetDirection,
            new BABYLON.Quaternion()
        );
        
        var strawberry_alignQuat = BABYLON.Quaternion.FromUnitVectorsToRef(
            localUp,
            targetDirection,
            new BABYLON.Quaternion()
        );
        var xRotQuat = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI);
        this.strawberry.rotationQuaternion = strawberry_alignQuat.multiply(xRotQuat);
        
        var flower_alignment = BABYLON.Quaternion.FromUnitVectorsToRef(
            localUp,
            targetDirection,
            new BABYLON.Quaternion()
        );
        var yRotQuat = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI);
        this.flower.rotationQuaternion = flower_alignment.multiply(yRotQuat);
        
        this.leaf.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
            localUp,
            targetDirection,
            new BABYLON.Quaternion()
        );
    }

    spawnStrawberryMesh(modelPath, texturePath) {
        BABYLON.SceneLoader.ImportMesh("", modelPath, "strawberry.glb", this.scene, (newMeshes) => {
        var mesh = newMeshes[1];
        mesh.parent = null;
        mesh.scaling.scaleInPlace(30); 

        var material = new BABYLON.PBRMaterial("material", this.scene);
        material.reflectivityColor = new BABYLON.Color3(1, 1, 0);
        material.metallic = 0.0;
        material.roughness = 0;
        material.reflectivityColor = new BABYLON.Color3(1, 1, 0);
        material.bumpTexture = new BABYLON.Texture(texturePath + "fragola_normals.png", this.scene);
        material.backFaceCulling = false;
        newMeshes[1].material = material;

        this.strawberry = mesh

        if (mesh.morphTargetManager != null) {
            this.strawberry_target1 = mesh.morphTargetManager.getTarget(0);
        }
        this.strawberry_target1.influence = 0;     

        this.update(this.parentOffset, this.parentDirection);
        return mesh;
        });   
    }

    spawnStemMesh(modelPath, texturePath) {
        BABYLON.SceneLoader.ImportMesh("", modelPath, "stem.glb", this.scene, (newMeshes) => {
        var mesh = newMeshes[1];
        mesh.parent = null;
        mesh.scaling.scaleInPlace(30); 

        var material = new BABYLON.PBRMaterial("material", this.scene);
        material.albedoColor = new BABYLON.Color3(0.13, 0.55, 0.13);
        material.metallic = 0.0;
        material.roughness = 0.4;
        material.reflectivityColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        material.backFaceCulling = false;
        mesh.material = material;
        this.stem = mesh

        if (mesh.morphTargetManager != null) {
            this.stem_target1 = mesh.morphTargetManager.getTarget(0);
        }
        this.stem_target1.influence = 0;     

        this.update(this.parentOffset, this.parentDirection);
        return mesh;
        });   
    }

     spawnLeafMesh(modelPath, texturePath) {
        BABYLON.SceneLoader.ImportMesh("", modelPath, "foglie.glb", this.scene, (newMeshes) => {
        var mesh = newMeshes[1];
        mesh.parent = null;
        mesh.scaling.scaleInPlace(30); 

        var material = new BABYLON.PBRMaterial("material", this.scene);
        material.albedoColor = new BABYLON.Color3(0.13, 0.55, 0.13);
        material.metallic = 0.0;
        material.roughness = 0.4;
        material.reflectivityColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        material.backFaceCulling = false;
        mesh.material = material;
        this.leaf = mesh

        if (mesh.morphTargetManager != null) {
            this.leaf_target1 = mesh.morphTargetManager.getTarget(0);
            this.leaf_target2 = mesh.morphTargetManager.getTarget(1);
        }
        this.leaf_target1.influence = 0;
        this.leaf_target2.influence = 0;             

        this.update(this.parentOffset, this.parentDirection);
        return mesh;
        });   
    }
    
    spawnFlowerMesh(modelPath, texturePath) {
        BABYLON.SceneLoader.ImportMesh("", modelPath, "petali_buoni.glb", this.scene, (newMeshes) => {
        var mesh = newMeshes[1];
        mesh.parent = null;
        mesh.scaling.scaleInPlace(30); 

        var material = new BABYLON.PBRMaterial("material", this.scene);
        material.albedoColor = new BABYLON.Color3(1, 1, 1);
        material.metallic = 0.0;
        material.roughness = 0.4;
        material.reflectivityColor = new BABYLON.Color3(1, 1, 1);
        material.backFaceCulling = false;
        mesh.material = material;

        this.flower = mesh

        if (mesh.morphTargetManager != null) {
            this.flower_target1 = mesh.morphTargetManager.getTarget(0);
        }
        this.flower_target1.influence = 0;

        this.update(this.parentOffset, this.parentDirection);
        return mesh;
        });   
    }

    /*
    update(normilizedElapsedTime) {
        if (normilizedElapsedTime > 0.5) {
            var growthValue = (normilizedElapsedTime -0.5) * 2;
            //var heightValue = 1 - normilizedElapsedTime;
            this.updateGrowth(growthValue);

            //update pos in hierachy
            //this.getTipTransform();
            //this.child.updatePosition(this.tipTransform_pos, this.tipTransform_dir);
            //this.child.update(normilizedElapsedTime);
        }
    }*/
    
    update(normilizedElapsedTime) {
        var growthValue = 0
        //var heightValue = 0;
        if (normilizedElapsedTime > 0.5) {
            var growthValue = (normilizedElapsedTime -0.5) * 2;
            if (growthValue < 0.1) {
                var growthValue = 0.1;
            }
            //var heightValue = normilizedElapsedTime;
        }
        else {
            var growthValue = 0.1;
            //var heightValue = 0.1;
        }
        this.updateGrowth(growthValue);
    }

    updatePosition(parentOffset, parentDirection) {
        if (this.strawberry != null && this.stem != null && this.flower != null) {
            this.parentOffset = parentOffset;
            this.parentDirection = parentDirection;

            this.strawberry.position = this.postion.add(this.parentOffset);
            this.stem.position = this.postion.add(this.parentOffset);
            this.flower.position = this.postion.add(this.parentOffset);
            this.leaf.position = this.postion.add(this.parentOffset);

            this.alignStrawberryObjectWithTangent();
        }
    }

    updateGrowth(growthValue) {
        const maxWeight = 1.0;
        const currentTime = performance.now() * 0.001;

        // Initialize growth start time
        if (this.growthStartTime === 0 && growthValue > 0) {
            this.growthStartTime = currentTime;
        }
        
        this.growth = growthValue;
        this.applyGrowthMorphs();
        
        return maxWeight * this.growth;
    }

    applyGrowthMorphs() {
        if (!this.flower_target1 || !this.strawberry_target1) return;
        
        var g = this.growth * 3;
        if (g <= 1) {
            this.flower_target1.influence = g; 
            this.leaf_target1.influence = g;
        } else if (g > 1 && g <= 3) {
            if (!this.hasChagnedColor) {
                this.strawberry.material.reflectivityColor = new BABYLON.Color3(1, 0.22, 0.25);
                this.strawberry.material.albedoColor = new BABYLON.Color3(1, 0.05, 0.05);
                this.hasChagnedColor = true;
            }
            var g2 = (g - 1) / 2;
            this.flower_target1.influence = 1 - g2; 
            this.leaf_target1.influence = 1 - g2;
            this.leaf_target2.influence = g2;
            this.strawberry_target1.influence = g2;
            this.stem_target1.influence = g2;
        }
    }

    destroy() {
        if (this.strawberry) {
            if (this.strawberry.material) {
                if (this.strawberry.material.bumpTexture) {
                    this.strawberry.material.bumpTexture.dispose();
                }
                if (this.strawberry.material.albedoTexture) {
                    this.strawberry.material.albedoTexture.dispose();
                }
                this.strawberry.material.dispose();
            }
            this.strawberry.dispose();
        }
        if (this.stem) {
            if (this.stem.material) {
                if (this.stem.material.albedoTexture) {
                    this.stem.material.albedoTexture.dispose();
                }
                this.stem.material.dispose();
            }
            this.stem.dispose();
        }
        if (this.flower) {
            if (this.flower.material) {
                if (this.flower.material.albedoTexture) {
                    this.flower.material.albedoTexture.dispose();
                }
                this.flower.material.dispose();
            }
            this.flower.dispose();
        }
        if (this.leaf) {
            if (this.leaf.material) {
                if (this.leaf.material.albedoTexture) {
                    this.leaf.material.albedoTexture.dispose();
                }
                this.leaf.material.dispose();
            }
            this.leaf.dispose();
        }
    }
}

// TriStrawberry - three strawberries arranged in a pattern
class TriStrowberry {
    constructor(name, scene) {
        this.name = name;
        this.scene = scene;
        this.mesh = null;
        this.tintColor = null;
        this.growth = null;
        this.parentOffset = new BABYLON.Vector3(0,0,0);
        this.parentDirection = null;
        this.postion = new BABYLON.Vector3(0,0,0);

        this.branch1 = null;
        this.branch2 = null;
        this.branch3 = null;

        this.strawberry1 = null;
        this.strawberry2 = null;
        this.strawberry3 = null;
        
        this.mesh = null;
        this.spline = null;
    }

    create() {
        this.mesh = BABYLON.Mesh.CreateSphere(this.name + "trileaf", 16, 0.03, this.scene);
        var material = new BABYLON.PBRMaterial("material", this.scene);
        material.albedoColor = new BABYLON.Color3(0.13, 0.55, 0.13);
        material.metallic = 0.0;
        material.roughness = 0.4;
        material.reflectivityColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        this.mesh.material = material;

        var strawberry1 = new Strawberry("strawberry1", this.scene)
        strawberry1.create()
        var branchMesh = new StrawberryMiniBranch("branch1", this.scene, 1, Math.PI + Math.PI/3, 1);
        branchMesh.parentOffset = this.parentOffset;       
        branchMesh.create();
        branchMesh.child = strawberry1;
        this.branch1 = branchMesh;
        this.strawberry1 = strawberry1;

        var strawberry2 = new Strawberry("strawberry2", this.scene)
        strawberry2.create()
        var branchMesh2 = new StrawberryMiniBranch("branch2", this.scene, 1, Math.PI, 1);
        branchMesh2.parentOffset = this.parentOffset;
        branchMesh2.create();
        branchMesh2.child = strawberry2;
        this.branch2 = branchMesh2;
        this.strawberry2 = strawberry2;

        var strawberry3 = new Strawberry("strawberry3", this.scene)
        strawberry3.create()
        var branchMesh3 = new StrawberryMiniBranch("branch3", this.scene, 1, Math.PI - Math.PI/3, 1);
        branchMesh3.parentOffset = this.parentOffset;
        branchMesh3.create();
        branchMesh3.child = strawberry3;
        this.branch3 = branchMesh3;
        this.strawberry3 = strawberry3;
    }

    update(normilizedElapsedTime) {
        /*var growthValue = normilizedElapsedTime;
        var heightValue = normilizedElapsedTime;
        this.updateGrowth(growthValue, heightValue);*/

        //update pos in hierachy
        //this.getTipTransform();
        //this.child.updatePosition(this.tipTransform_pos, this.tipTransform_dir); 
        if (this.branch1) {
            this.branch1.update(normilizedElapsedTime);
        }
        if (this.branch2) {
            this.branch2.update(normilizedElapsedTime);
        }
        if (this.branch3) {
            this.branch3.update(normilizedElapsedTime);
        }
    }

    updatePosition(parentOffset, parentDirection) {
        this.parentOffset = parentOffset;
        this.parentDirection = parentDirection;
        this.mesh.position = this.postion.add(parentOffset);

        if (this.branch1 && this.branch2 && this.branch3) {
            this.branch1.updatePosition(this.parentOffset, this.parentDirection);
            this.branch2.updatePosition(this.parentOffset, this.parentDirection);
            this.branch3.updatePosition(this.parentOffset, this.parentDirection);
        }
    }

    updateGrowth(growthValue) {
        let totalWeight = 0;
        /*
        if (this.branch1) {
            totalWeight += this.branch1.updateGrowth(currentTime, growthValue);
        }
        if (this.branch2) {
            totalWeight += this.branch2.updateGrowth(currentTime, growthValue);
        }
        if (this.branch3) {
            totalWeight += this.branch3.updateGrowth(currentTime, growthValue);
        }*/
        
        return totalWeight;
    }

    destroy() {
        if (this.strawberry1) this.strawberry1.destroy();
        if (this.strawberry2) this.strawberry2.destroy();
        if (this.strawberry3) this.strawberry3.destroy();
        if (this.branch1) this.branch1.destroy();
        if (this.branch2) this.branch2.destroy();
        if (this.branch3) this.branch3.destroy();
        if (this.mesh) {
            if (this.mesh.material) {
                if (this.mesh.material.albedoTexture) {
                    this.mesh.material.albedoTexture.dispose();
                }
                this.mesh.material.dispose();
            }
            this.mesh.dispose();
        }
    }
}
 