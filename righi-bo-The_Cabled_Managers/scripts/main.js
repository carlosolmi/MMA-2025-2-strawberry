window.addEventListener("DOMContentLoaded", async function () {

    // -------------- ENGINE and SCENE CREATION ----------------
    // Create the BabylonJS engine
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);

    // Create a basic scene
    var scene = new BABYLON.Scene(engine);

    // -------------- SCENE SETUP ----------------
    var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 3, new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);
    camera.setPosition(new BABYLON.Vector3(-10, 10, -10));
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 50;
    camera.wheelDeltaPercentage = 0.01;
    camera.minZ = 0.1;
    
    //lights
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 1;
	light.specular = BABYLON.Color3.Black();

    var light2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
    light2.position = new BABYLON.Vector3(0, 5, 5);

    // Shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
	
    //ground
    var helper = scene.createDefaultEnvironment({
            enableGroundShadow: true,
            groundSize: 50,
            skyboxSize: 5000
        });
    helper.setMainColor(new BABYLON.Color3(0.0, 0.005, 0.02));
    helper.ground.position.y -= 1.5;

    //const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./environment/parched_canal_2k.env", scene);
    //const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./environment/spaichingen_hill_2k.env", scene);
    const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./environment/golden_gate_hills_2k.env", scene);
    scene.environmentTexture = envTexture;

    //engine.displayLoadingUI();
    BABYLON.SceneLoader.ImportMesh("", "models/dirt/", "dirtpile.glb", scene, function(newMeshes){
        var texturePath = "models/dirt/"
        var mesh = newMeshes[1];
        mesh.parent = null;
        mesh.position = new BABYLON.Vector3(0, 3.5, 0);
        //mesh.parent.scaling.x *= -1
        //mesh.rotation.z = Math.PI; 
        mesh.scaling.scaleInPlace(200); 
        //newMeshes.forEach(mesh => {
            mesh.isPickable = true;    
            var pbr = new BABYLON.PBRMaterial("pbr_" + mesh.name, scene);
            pbr.albedoTexture = new BABYLON.Texture(texturePath + "dirt_baseColor.png", scene);
            //pbr.albedoTexture.hasAlpha = true;
            pbr.backFaceCulling = false;
            //pbr.albedoColor = new BABYLON.Color3(0.2, 0.8, 0.2);
            // Multiply texture with color (like Blender multiply node)
            pbr.metallicTexture = new BABYLON.Texture(texturePath + "dirt_metallicRoughness.png", scene);
            pbr.useRoughnessFromMetallicTextureGreen = true;
            pbr.useMetallnessFromMetallicTextureBlue = false;
            pbr.normalTexture = new BABYLON.Texture(texturePath + "dirt_normal.png", scene);
            //pbr.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHATEST;
            
            mesh.material = pbr;
            engine.hideLoadingUI();
        //})
    });   


    // ----------------- main plant beheavior -----------------

/*

    var trileaf4 = new TriLeaf("trileaf", scene);
    trileaf4.create();

    var trileaf5 = new TriLeaf("trileaf", scene);
    trileaf5.create();

    var trileaf6 = new TriLeaf("trileaf", scene);
    trileaf6.create();

    var trileaf7 = new TriLeaf("trileaf", scene);
    trileaf7.create();

    var trileaf8 = new TriLeaf("trileaf", scene);
    trileaf8.create();

    var tristroberry = new TriStrowberry("tristroberry", scene);
     tristroberry.create();


    var branch2 = new Branch("branch2", scene, 1, Math.PI/3)
    branch2.create();   
    branch2.updateCurve(0.5, .6)
    var branch3 = new Branch("branch3", scene, 1, 2*Math.PI/3)
    branch3.create();
    branch3.child = tristroberry;
    branch3.update(branch3.parentOffset, branch3.parentDirection);
    branch3.updateCurve(0.5, .6)

    var strawberry1 = new Strawberry("Strawberry1", scene)
    strawberry1.create()
    branch2.child = strawberry1;
       
    var branch4 = new Branch("branch4", scene, 1, Math.PI)
    branch4.create();
    branch4.updateCurve(0, .8)
    branch4.updateCurve(1, branch4.growth)
    branch4.child = trileaf4;

    var branch5 = new Branch("branch4", scene, 1, Math.PI/3)
    branch5.create();
    branch5.updateCurve(0, branch5.growth)
    branch5.updateCurve(0.3, .9)
    branch5.child = trileaf5;

    var branch6 = new Branch("branch4", scene, 1, -1* Math.PI/4)
    branch6.create();
    branch6.updateCurve(0,1)
    branch6.updateCurve(.8, branch6.growth)
    branch6.child = trileaf6;

    var branch8= new Branch("branch4", scene, 1, 2*Math.PI/4)
    branch8.create();
    branch8.updateCurve(0, branch8.growth)
    branch8.updateCurve(.5, 1)
    branch8.child = trileaf8;

    var branch7 = new Branch("branch4", scene, 1, 3*Math.PI/2)
    branch7.create();
    branch7.updateCurve(0, .5)
    branch7.updateCurve(.9, branch7.growth)
    branch7.child = trileaf7;


*/
    //gui

    scene.debugLayer.show()
    var oldgui = document.querySelector("#datGUI");
    if (oldgui != null) {
        oldgui.remove();
    }

    var gui = new dat.GUI();	
    gui.domElement.style.marginTop = "100px";
    gui.domElement.id = "datGUI";

    var options = {
        sunAngle: 0
    }

    gui.add(options, "sunAngle", 0, 2 * Math.PI).onChange(function(value) { 
        if (plant) {
            plant.sunAngle = value;
        }
    });


    // Create plant
    var plant = new Plant(scene);

    // UPDATE LOOP
    scene.registerBeforeRender(() => {
        if (!scene.isReady()) return;
        
        if (plant) {
            plant.update();
        }
    });

    // ---------------- UPDATE LOOP ------------------
    /*
    var frameCounter = 0;
    var frameCounter2 = 0;
        var frameCounter3 = 0;
    //var upperBranches = [];
    //var strawberryBrenches = [];
    //var lowerBranches = [];

    //UPDATE LOOP
    scene.registerBeforeRender( () => {
        var deltaTime = scene.deltaTime * 0.001;
        let t = performance.now() * 0.001;
        let phi = t * 1;

        frameCounter++
        
    if (frameCounter >= 100) {
        //branch2.update(branch2.parentOffset, branch2.parentDirection);
        frameCounter = 0;  // Reset
        //trileaf.update(trileaf.parentOffset, trileaf.parentDirection);
        branch4.update(branch4.parentOffset, branch4.parentDirection);  
        branch3.update(branch3.parentOffset, branch3.parentDirection);
        branch2.update(branch2.parentOffset, branch2.parentDirection);
        //trileaf2.update(trileaf.parentOffset, trileaf.parentDirection);

        trileaf4.update(trileaf4.parentOffset, trileaf4.parentDirection);
        //trileaf3.update(trileaf.parentOffset, trileaf.parentDirection);
        trileaf5.update(trileaf5.parentOffset, trileaf5.parentDirection);
        trileaf6.update(trileaf6.parentOffset, trileaf6.parentDirection);
        trileaf7.update(trileaf7.parentOffset, trileaf7.parentDirection);
        trileaf8.update(trileaf8.parentOffset, trileaf8.parentDirection);

        branch5.update(branch4.parentOffset, branch5.parentDirection);  
        branch6.update(branch6.parentOffset, branch6.parentDirection);  
        branch7.update(branch7.parentOffset, branch7.parentDirection);  
        branch8.update(branch8.parentOffset, branch8.parentDirection);
       
    }
     frameCounter2++;
    if (frameCounter2 >= 20) {
             strawberry1.calculateGrow(frameCounter2);
   
    }

      frameCounter3++;
    if (frameCounter3 >= 200) {
          tristroberry.calculateGrow(frameCounter3);
    }
              
        //Update _root_ movement
        if(!scene.isReady()){return;}
    });
    */

    // ---------------- RENDER LOOPS ------------------
    // Start the rendering loop
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Resize the engine when the window is resized
    window.addEventListener("resize", function () {
        engine.resize();
    });
});

