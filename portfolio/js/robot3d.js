// ==========================================
// 3D Interactive Robot (Three.js)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('robot3d-container');
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    
    // Transparent background
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 5;

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x818cf8, 2); // Indigo light
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    // 3. Load Model
    let robot = null;
    const loader = new THREE.GLTFLoader();
    
    loader.load('images/robotic_eye.glb', function(gltf) {
        robot = gltf.scene;
        
        // Auto scale and center the model
        const box = new THREE.Box3().setFromObject(robot);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        
        robot.position.x += (robot.position.x - center.x);
        robot.position.y += (robot.position.y - center.y);
        robot.position.z += (robot.position.z - center.z);
        
        // Scale to fit nicely in the view (adjust 2.5 based on standard bounding sphere)
        const targetSize = 2.5; 
        const scale = targetSize / size;
        robot.scale.setScalar(scale);

        scene.add(robot);
    }, undefined, function(error) {
        console.error('Error loading 3D model (likely missing file or CORS issue). Falling back to placeholder.', error);
        
        // Fallback placeholder (a cool floating tech core)
        const geometry = new THREE.IcosahedronGeometry(1.5, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x4f46e5, 
            wireframe: true,
            emissive: 0x818cf8,
            emissiveIntensity: 0.5
        });
        robot = new THREE.Mesh(geometry, material);
        scene.add(robot);
    });

    // 4. Interaction Variables
    let targetRotationX = 0;
    let targetRotationY = 0;
    
    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    // Translation Variables (for chasing the cursor)
    let targetX = windowHalfX;
    let targetY = windowHalfY;
    let currentX = windowHalfX;
    let currentY = windowHalfY;

    // Track Mouse
    document.addEventListener('mousemove', (event) => {
        // Normalized mouse coordinates (-1 to 1)
        mouseX = (event.clientX - windowHalfX) / windowHalfX;
        mouseY = (event.clientY - windowHalfY) / windowHalfY;

        // Pixel coordinates for chasing
        targetX = event.clientX;
        targetY = event.clientY;
    });

    // Track Scroll
    let scrollY = window.scrollY;
    document.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Resize Handle
    window.addEventListener('resize', () => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        if(container.clientWidth > 0 && container.clientHeight > 0) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });

    // 5. Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        // Smoothly move the container towards the mouse (Cursor Chasing)
        // Adjust the multiplier (0.04) to make it chase faster or slower
        currentX += (targetX - currentX) * 0.04;
        currentY += (targetY - currentY) * 0.04;
        
        // Offset by 100 (half of 200px width/height) to center it, 
        // plus an extra 20px so it floats slightly below/right of the cursor
        container.style.transform = `translate3d(${currentX - 80}px, ${currentY - 80}px, 0)`;

        if (robot) {
            // Idle floating animation
            const time = clock.getElapsedTime();
            robot.position.y = Math.sin(time * 2) * 0.1;

            // Target rotations based on mouse
            targetRotationY = mouseX * (Math.PI / 3); 
            targetRotationX = mouseY * (Math.PI / 4); 

            // Add scroll effect (flipping/spinning)
            const scrollSpin = scrollY * 0.005; 

            // Smooth interpolation (lerp) towards target
            robot.rotation.y += (targetRotationY + scrollSpin - robot.rotation.y) * 0.1;
            robot.rotation.x += (targetRotationX - robot.rotation.x) * 0.1;
        }

        renderer.render(scene, camera);
    }
    
    animate();
});
