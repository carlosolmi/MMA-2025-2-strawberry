class SingleLeaf {
    constructor(name, scene) {
        this.name = name;
        this.scene = scene;
        this.mesh = null;
        this.tintColor = null;
        this.growth = null;
        this.parentOffset = new BABYLON.Vector3(0,0,0);
        this.parentDirection = null;
        this.postion = new BABYLON.Vector3(0,0,0);
        this.child = null;
        this.mesh = null;
        this.spline = null;
    }

    create() {
        this.spawnMesh("models/leaf/", "models/leaf/textures/leaf_");
    }

    spawnMesh(modelPath, texturePath) {
       BABYLON.SceneLoader.ImportMesh("", modelPath, "leafUp(Y_up_setting).glb", this.scene, (newMeshes) => {
        var mesh = newMeshes[1];
        mesh.parent = null;
        mesh.rotation.z -= Math.PI/2;
        mesh.scaling.scaleInPlace(30); 

        mesh.isPickable = true;    
        var pbr = new BABYLON.PBRMaterial("pbr_" + mesh.name, this.scene);
        pbr.albedoTexture = new BABYLON.Texture("models/leaf/textures/leaf_baseColor.png", this.scene);
        pbr.albedoTexture.hasAlpha = true;
        pbr.backFaceCulling = false;
        pbr.albedoColor = new BABYLON.Color3(0.2, 0.8, 0.2);
        
        pbr.metallicTexture = new BABYLON.Texture(texturePath + "metallicRoughness.png", this.scene);
        pbr.useRoughnessFromMetallicTextureGreen = true;
        pbr.useMetallnessFromMetallicTextureBlue = true;
        pbr.bumpTexture = new BABYLON.Texture(texturePath + "normal.png", this.scene);
        pbr.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHATESTANDBLEND;
        
        mesh.material = pbr;
        
        this.mesh = mesh
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
            //var heightValue = normilizedElapsedTime;
            if (growthValue < 0.1) {
                var growthValue = 0.1;
            }
        }
        else {
            var growthValue = 0.1;
            //var heightValue = 0.1;
        }
        this.updateGrowth(growthValue);
    }

    updatePosition(parentOffset, parentDirection) {
        if (this.mesh) {
            this.parentOffset = parentOffset;
            this.parentDirection = parentDirection;
            this.mesh.position = this.parentOffset;
            this.leafAlignObjectWithTangent();
        }
    }

    updateGrowth(growthValue) {
        const maxWeight = 0.1;
        this.growth = growthValue;
        
        // Scale mesh based on growth
        if (this.mesh) {
            const scale = 30 * this.growth;
            this.mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
        }
        
        return maxWeight * this.growth;
    }

    leafAlignObjectWithTangent() {
        var localUp = BABYLON.Vector3.Up();
        var targetDirection = this.parentDirection;
        
        var alignQuat = BABYLON.Quaternion.FromUnitVectorsToRef(
            localUp,
            targetDirection,
            new BABYLON.Quaternion()
        );
        
        var yRotQuat = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI/2);
        this.mesh.rotationQuaternion = alignQuat.multiply(yRotQuat);
    }

    alignObjectWithTangent() {
        var localUp = BABYLON.Vector3.Up();
        var targetDirection = this.parentDirection;
        
        this.mesh.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
            localUp,
            targetDirection,
            new BABYLON.Quaternion()
        );
    }

    destroy() {
        if (this.mesh) {
            if (this.mesh.material) {
                // Dispose all textures
                if (this.mesh.material.albedoTexture) {
                    this.mesh.material.albedoTexture.dispose();
                }
                if (this.mesh.material.metallicTexture) {
                    this.mesh.material.metallicTexture.dispose();
                }
                if (this.mesh.material.bumpTexture) {
                    this.mesh.material.bumpTexture.dispose();
                }
                this.mesh.material.dispose();
            }
            this.mesh.dispose();
        }
    }
}


// TriLeaf - three leaves arranged in a pattern
class TriLeaf {
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

        var leaf = new SingleLeaf("leaf1", this.scene);
        leaf.create();
        var branchMesh = new LeafMiniBranch("branch1", this.scene, 1, Math.PI + Math.PI/3, 1);
        branchMesh.parentOffset = this.parentOffset;       
        branchMesh.create();
        branchMesh.child = leaf;
        this.branch1 = branchMesh;

        var leaf2 = new SingleLeaf("leaf2", this.scene);
        leaf2.create();
        var branchMesh2 = new LeafMiniBranch("branch2", this.scene, 1, Math.PI, 1);
        branchMesh2.parentOffset = this.parentOffset;
        branchMesh2.create();
        branchMesh2.child = leaf2;
        this.branch2 = branchMesh2;

        var leaf3 = new SingleLeaf("leaf3", this.scene);
        leaf3.create();
        var branchMesh3 = new LeafMiniBranch("branch3", this.scene, 1, Math.PI - Math.PI/3, 1);
        branchMesh3.parentOffset = this.parentOffset;
        branchMesh3.create();
        branchMesh3.child = leaf3;
        this.branch3 = branchMesh3;
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

        if (this.branch1) {
            this.branch1.updatePosition(this.parentOffset, this.parentDirection);
        }
        if (this.branch2) {
            this.branch2.updatePosition(this.parentOffset, this.parentDirection);
        }
        if (this.branch3) {
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
        if (this.branch1) {
            if (this.branch1.child) this.branch1.child.destroy();
            this.branch1.destroy();
        }
        if (this.branch2) {
            if (this.branch2.child) this.branch2.child.destroy();
            this.branch2.destroy();
        }
        if (this.branch3) {
            if (this.branch3.child) this.branch3.child.destroy();
            this.branch3.destroy();
        }
        if (this.mesh) {
            if (this.mesh.material) {
                // Dispose textures
                if (this.mesh.material.albedoTexture) {
                    this.mesh.material.albedoTexture.dispose();
                }
                if (this.mesh.material.metallicTexture) {
                    this.mesh.material.metallicTexture.dispose();
                }
                if (this.mesh.material.bumpTexture) {
                    this.mesh.material.bumpTexture.dispose();
                }
                this.mesh.material.dispose();
            }
            this.mesh.dispose();
        }
    }
}
 