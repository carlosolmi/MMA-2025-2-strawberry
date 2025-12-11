function rotatePointAroundAxis(point, axis, angle) {
    var matrix = BABYLON.Matrix.RotationAxis(axis, angle);
    return BABYLON.Vector3.TransformCoordinates(point, matrix);
}

// Base class with all common functionality
class BranchEntity {
    constructor(name, scene, high, rotationAngle = 0, growth = 1, bezierParams) {
        this.name = name;
        this.scene = scene;
        this.high = high;
        this.rotationAngle = rotationAngle;
        this.growth = growth;

        // Bezier curve shape parameters
        this.controlBase = bezierParams.controlBase;
        this.controlHighFactor = bezierParams.controlHighFactor;
        this.controlHighOffset = bezierParams.controlHighOffset;
        this.endBase = bezierParams.endBase;
        this.endHighMultiplier = bezierParams.endHighMultiplier;

        this.parentOffset = new BABYLON.Vector3(0, 0, 0);
        this.parentDirection = null;
        this.position = new BABYLON.Vector3(0, 0, 0);
        this.child = null;

        this.mesh = null;
        this.spline = null;
        this.tipTransform_pos = null;
        this.tipTransform_dir = null;
        this.tangentVisualizer = null;
        this.children = null;
    }

    create() {
        var startPoint = new BABYLON.Vector3(0, 0, 0);
        
        // Calculate control point using parameters
        var controlPoint = new BABYLON.Vector3(
            (this.controlBase.x + this.controlHighFactor.x / (this.high + this.controlHighOffset)) * this.growth,
            (this.controlBase.y * this.high + this.controlHighFactor.y) * this.growth,
            this.controlBase.z * this.growth
        );
        
        // Calculate end point using parameters
        var endPoint = new BABYLON.Vector3(
            this.endBase.x * this.growth,
            (this.high * this.endHighMultiplier.y + this.endBase.y) * this.growth,
            this.endBase.z * this.growth
        );
        
        // Rotate control and end points around Y-axis
        if (this.rotationAngle !== 0) {
            var axis = BABYLON.Vector3.Up(); // Y-axis
            controlPoint = rotatePointAroundAxis(controlPoint, axis, this.rotationAngle);
            endPoint = rotatePointAroundAxis(endPoint, axis, this.rotationAngle);
        }

        // Align to parent direction
        if (this.parentDirection) {
            var quat = BABYLON.Quaternion.FromUnitVectorsToRef(
                BABYLON.Vector3.Up(),
                this.parentDirection,
                new BABYLON.Quaternion()
            );
            var matrix = new BABYLON.Matrix();
            quat.toRotationMatrix(matrix);
            
            // Rotate all points
            startPoint = BABYLON.Vector3.TransformCoordinates(startPoint, matrix);
            controlPoint = BABYLON.Vector3.TransformCoordinates(controlPoint, matrix);
            endPoint = BABYLON.Vector3.TransformCoordinates(endPoint, matrix);
        }

        // Add parent offset
        startPoint = startPoint.add(this.parentOffset);
        controlPoint = controlPoint.add(this.parentOffset);
        endPoint = endPoint.add(this.parentOffset);
        
        var quadraticBezierVectors = BABYLON.Curve3.CreateQuadraticBezier(
            startPoint,
            controlPoint,
            endPoint,
            25
        );
        this.spline = quadraticBezierVectors;
        this.tipPosition = endPoint;
        
        var path = quadraticBezierVectors.getPoints();
        
        // Shape profile in XY plane - Circle
        const shape = [];
        const radius = 0.015;
        const segments = 64;

        for (var theta = 0; theta < 2 * Math.PI; theta += (2 * Math.PI) / segments) {
            shape.push(new BABYLON.Vector3(radius * Math.cos(theta), radius * Math.sin(theta), 0));
        }

        var extruded = BABYLON.MeshBuilder.ExtrudeShape(
            "extrudedShape", 
            { shape: shape, path: path, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, 
            this.scene
        );
        
        var material = new BABYLON.PBRMaterial("material", this.scene);
        material.albedoColor = new BABYLON.Color3(0.13, 0.55, 0.13);
        material.metallic = 0.0;
        material.roughness = 0.4;
        material.reflectivityColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        extruded.material = material;

        this.getTipTransform();
        
        this.mesh = extruded;
        return this.mesh;
    }

    getTipTransform() {
        var path = this.spline.getPoints();
        var lastPoint = path[25];
        var secondLastPoint = path[24];
        var tangent = lastPoint.subtract(secondLastPoint).normalize();
        
        this.tipTransform_pos = lastPoint; 
        this.tipTransform_dir = tangent;
    }

    visualizeTangent() {     
        var size = 1;
        var endPoint = this.tipTransform_pos.add(this.tipTransform_dir.normalize().scale(size));
        var myPoints = [
            this.tipTransform_pos,
            endPoint,
        ];
        var lines = BABYLON.MeshBuilder.CreateLines("lines", {points: myPoints}, this.scene);
        lines.color = new BABYLON.Color3(1, 0, 0);
    }

    update(normilizedElapsedTime) {
        var growthValue = normilizedElapsedTime;
        var heightValue = normilizedElapsedTime;
        this.updateGrowth(growthValue, heightValue);

        //update pos in hierachy
        this.getTipTransform();
        this.child.updatePosition(this.tipTransform_pos, this.tipTransform_dir);
        this.child.update(normilizedElapsedTime);
    }

    updatePosition(parentOffset, parentDirection) {
        if (parentOffset != this.parentOffset || parentDirection != this.parentDirection) {
            this.parentOffset = parentOffset;
            this.parentDirection = parentDirection;
            this.recreateMesh();
        }

        if (this.child) {
            this.getTipTransform();
            this.child.updatePosition(this.tipTransform_pos, this.tipTransform_dir);
        }
    }

    updateGrowth(growthValue, heightValue) {
        // Get weight from child first
        let totalWeight = 0;
        /*if (this.child) {
            totalWeight = this.child.updateGrowth(growthValue);
        }*/
        
        // Update this branch's properties
        this.growth = growthValue;
        this.high = heightValue; //Math.max(0.1, 1 - totalWeight * 0.5); // Inverse proportional
        this.recreateMesh();
        
        return totalWeight;
    }

    recreateMesh() {
        if (this.mesh) {
            var oldmesh = this.mesh;
            var oldMaterial = oldmesh.material;
            
            // Create new mesh first
            this.create();
            
            // Then dispose old ones
            oldmesh.dispose();
            if (oldMaterial) {
                // Dispose textures
                if (oldMaterial.albedoTexture) {
                    oldMaterial.albedoTexture.dispose();
                }
                if (oldMaterial.metallicTexture) {
                    oldMaterial.metallicTexture.dispose();
                }
                if (oldMaterial.bumpTexture) {
                    oldMaterial.bumpTexture.dispose();
                }
                oldMaterial.dispose();
            }
        } else {
            this.create();
        }
    }

    destroy() {
        if (this.child) {
            this.child.destroy();
        }
        if (this.mesh) {
            if (this.mesh.material) {
                // Dispose textures if they exist
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


// Main branch - with dehydration stress deformation
class Branch extends BranchEntity {
    constructor(name, scene, high, rotationAngle = 0, growth = 1) {
        var random = Math.random();
        if (random < 0.3) {random = 0.3 + random;}
        super(name, scene, high, rotationAngle, growth, {
            controlBase: new BABYLON.Vector3(random, random * 5, 0), // new BABYLON.Vector3(1, 5, 0),
            controlHighFactor: new BABYLON.Vector3(random / 2, 0, 0), // new BABYLON.Vector3(0.5, 0, 0),
            controlHighOffset: 0.5,
            endBase: new BABYLON.Vector3(random * 3, random * 2, 0), // new BABYLON.Vector3(3, 2, 0),
            endHighMultiplier: new BABYLON.Vector3(0, random * 3, 0) //new BABYLON.Vector3(0, 3, 0)
        });
    }
}

// Leaf mini branch - for connecting leaves to main branches
class LeafMiniBranch extends BranchEntity {
    constructor(name, scene, high, rotationAngle = 0, growth = 1) {
        var random = Math.random() /5;
        super(name, scene, high, rotationAngle, growth, {
            controlBase: new BABYLON.Vector3(0, random * 0.25, 0), // new BABYLON.Vector3(0, 0.05, 0),
            controlHighFactor: new BABYLON.Vector3(0, random, 0), // new BABYLON.Vector3(0, 0.2, 0),
            controlHighOffset: 0,
            endBase: new BABYLON.Vector3(0.2, random * 0.25, 0), // new BABYLON.Vector3(0.2, 0.05, 0)
            endHighMultiplier: new BABYLON.Vector3(0, random * 2, 0) // new BABYLON.Vector3(0, 0.4, 0),
        });
    }

    update(normilizedElapsedTime) {
        var growthValue = 0
        var heightValue = 0;
        if (normilizedElapsedTime > 0.5) {
            var growthValue = (normilizedElapsedTime -0.5) * 2;
            var heightValue = normilizedElapsedTime;
            if (growthValue < 0.2) {
                var growthValue = 0.2;
            }
        }
        else {
            var growthValue = 0.2;
            var heightValue = 0.2;
        }
        this.updateGrowth(growthValue, heightValue);

        //update pos in hierachy
        this.getTipTransform();
        this.child.updatePosition(this.tipTransform_pos, this.tipTransform_dir);
        this.child.update(normilizedElapsedTime);
    }
}

// Strawberry mini branch - for connecting strawberries to main branches
class StrawberryMiniBranch extends BranchEntity {
    constructor(name, scene, high, rotationAngle = 0, growth = 1) {
        var random = Math.random() /5;
        super(name, scene, high, rotationAngle, growth, {
            controlBase: new BABYLON.Vector3(0, random * 0.25, 0), // new BABYLON.Vector3(0.5, 0.2, 0),
            controlHighFactor: new BABYLON.Vector3(0, random, 0), // new BABYLON.Vector3(0, 0.2, 0),
            controlHighOffset: 0,
            endBase: new BABYLON.Vector3(0.2, random * 0.25, 0), // new BABYLON.Vector3(0.2, 0.05, 0)
            endHighMultiplier: new BABYLON.Vector3(0, random * 2, 0) // new BABYLON.Vector3(0, 0.4, 0),
        });
    }

    update(normilizedElapsedTime) {
        var growthValue = 0
        var heightValue = 0;
        if (normilizedElapsedTime > 0.5) {
            var growthValue = (normilizedElapsedTime -0.5) * 2;
            var heightValue = normilizedElapsedTime;
            if (growthValue < 0.2) {
                var growthValue = 0.2;
            }
        }
        else {
            var growthValue = 0.2;
            var heightValue = 0.2;
        }
        this.updateGrowth(growthValue, heightValue);

        //update pos in hierachy
        this.getTipTransform();
        this.child.updatePosition(this.tipTransform_pos, this.tipTransform_dir);
        this.child.update(normilizedElapsedTime);
    }
}