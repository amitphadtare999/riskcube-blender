function resetAllPieces() {
    puzzlePieces.forEach(piece => {
        const originalY = originalPositions[piece.uuid];
        const originalMaterial = originalMaterials[piece.uuid];
        
        // Only animate if not already at original position
        if (Math.abs(piece.position.y - originalY) > 0.01) {
            gsap.to(piece.position, {
                y: originalY,
                duration: 0.5,
                ease: "power2.out"
            });
        }
        
        // Compare current color with original color
        const currentColor = piece.material.color;
        const originalColor = originalMaterial.color;
        const colorDiff = Math.abs(currentColor.r - originalColor.r) + 
                         Math.abs(currentColor.g - originalColor.g) + 
                         Math.abs(currentColor.b - originalColor.b);
        
        // Only animate if color is significantly different
        if (colorDiff > 0.1) {
            gsap.to(piece.material.color, {
                r: originalColor.r,
                g: originalColor.g,
                b: originalColor.b,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    });
}

// Handle hover effects - FIXED VERSION
function handleHover(intersects) {
    if (intersects.length > 0) {
        const hoveredPiece = intersects[0].object;
        
        // Only apply hover effect to this specific piece
        gsap.to(hoveredPiece.position, {
            y: originalPositions[hoveredPiece.uuid] + 0.2,
            duration: 0.5,
            ease: "power2.out"
        });
        
        gsap.to(hoveredPiece.material.color, {
            r: 0.5,
            g: 0.7,
            b: 1,
            duration: 0.5,
            ease: "power2.out"
        });
    }
}

// ... (keep the rest of the code the same)


//     window.addEventListener('mousemove', (event) => {
//         // Calculate mouse position in normalized device coordinates
//         mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//         mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
//         // Update raycaster
//         raycaster.setFromCamera(mouse, camera);
        
//         // Find intersected objects
//         const intersects = raycaster.intersectObject(model, true);
        
//         // Reset previous hovered mesh
       
        
        
//         if (hoveredMesh && hoveredMesh!== risk_mesh) {
//             hoveredMesh.position.copy(originalPositions.get(hoveredMesh));
//             hoveredMesh.material = originalMaterials.get(hoveredMesh);
//             hoveredMesh.children.forEach(child => {
//                         child.material = hoverMaterial
//                     });
//             hoveredMesh = null;
//         }
//         else if (hoveredMesh && hoveredMesh=== risk_mesh) {
//             hoveredMesh.material = hoverMaterial;
//             risk_mesh.children.forEach(child => {
//                 child.material = defaultMaterial
//             });
//         }
//          // Apply hover effect to new mesh
//         if (intersects.length > 0) {
            
//             hoveredMesh = intersects[0].object;
//             console.log("Hovered mesh:", hoveredMesh.parent.children);
//             if(hoveredMesh.parent.children.length>5){
//             // Only apply if it's a mesh from our model
//                  if(hoveredMesh===risk_position){
//                     hoveredMesh.material = hoverMaterial;
//                     risk_mesh.children.forEach(child=>{
//                         child.material=defaultMaterial;
//                     });
//                 }
//                 else if (originalPositions.has(hoveredMesh) && hoveredMesh!== risk_mesh) {
//                     const originalPos = originalPositions.get(hoveredMesh);
//                     hoveredMesh.position.y = originalPos.y + 1; // Lift by 10 units
//                     hoveredMesh.material = hoverMaterial;
//                     hoveredMesh.children.forEach(child => {
//                         child.material = defaultMaterial
//                     });
//                     risk_mesh.material=defaultMaterial;
                        
//                          risk_mesh.children.forEach(child => {
//                         child.material=hoverMaterial;
//                     });
//                 }
//             }
//         }
//         else{
//             risk_mesh.material = hoverMaterial;
//             risk_mesh.children.forEach(child => {
//                 child.material = new THREE.MeshStandardMaterial({
//                     color: 0xffffff, // White
//                     metalness: 0,
//                     roughness: 0
//                             });
//                     });
//         }
    
//     });
    
// });


    // 3. Fixed hover handler:
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(model, true);
        
        // Reset previous hover (with proper material restoration)
        if (hoveredMesh) {
            gsap.to(hoveredMesh.position, { 
                y: originalPositions.get(hoveredMesh).y,
                duration: 0.3 
            });
            
            // Restore FULL original material
            hoveredMesh.material = originalMaterials.get(hoveredMesh).clone();
            
            // Special handling for risk_mesh children
            if (hoveredMesh === risk_mesh) {
                risk_mesh.children.forEach(child => {
                    child.material = originalMaterials.get(child).clone();
                });
            }
        }
        
        // Apply new hover
        if (intersects.length > 0) {
            hoveredMesh = intersects[0].object;
            
            // Only affect direct puzzle pieces (not text)
            if (hoveredMesh.parent.children.length > 5 && 
                hoveredMesh !== risk_mesh && 
                !hoveredMesh.name.includes('_text')) {
                
                gsap.to(hoveredMesh.position, {
                    y: originalPositions.get(hoveredMesh).y + 1,
                    duration: 0.3,
                    ease: "power2.inOut"
                });
                
                // Apply hover material while preserving other properties
                const newMat = originalMaterials.get(hoveredMesh).clone();
                newMat.color.set(hoverMaterial.color);
                newMat.metalness = hoverMaterial.metalness;
                newMat.roughness = hoverMaterial.roughness;
                hoveredMesh.material = newMat;
                
                // Handle risk_mesh
                risk_mesh.material = originalMaterials.get(risk_mesh).clone();
                risk_mesh.children.forEach(child => {
                    const childMat = originalMaterials.get(child).clone();
                    childMat.color.set(0xffffff);
                    child.material = childMat;
                });
            }
        } else {
            // Reset risk_mesh when nothing is hovered
            risk_mesh.material = originalMaterials.get(risk_mesh).clone();
            risk_mesh.children.forEach(child => {
                child.material = originalMaterials.get(child).clone();
            });
        }
    });
});


//text adding code temporary
            puzzlePieces.forEach((piece) => {
      // Only proceed if this is one of your 15 main pieces
    console.log("piece:", piece);
    
   
        createTextForPiece(piece);
     
    });

  

// 3. Function to create text for each piece

function createTextForPiece(piece) {
  // Text geometry parameters
  const text = `Test Piece`;
  const textGeometry = new TextGeometry(text, {
     // Use the loaded font
    size: 0.1,          // Adjust based on your scene scale
    height: 0.1,       // Extrusion depth
    curveSegments: 8,
    bevelEnabled: false
  });
  console.log("Text Geometry:", textGeometry);
  // Center the text
  textGeometry.computeBoundingBox();
  const center = new THREE.Vector3();
  textGeometry.boundingBox.getCenter(center);
  textGeometry.translate(-center.x, -center.y, -center.z);

  // Text material
  const textMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000ff,
    metalness: 0,
    roughness: 0
  });

  // Create mesh
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);

  // Position slightly above the puzzle piece
  textMesh.position.z = 1; // Adjust based on your scene scale
  textMesh.position.y = piece.position.y + 1; // Adjust based on your scene scale
  textMesh.position.x = piece.position.x; // Center text on the piece
  // Make text face the camera initially
  textMesh.lookAt(camera.position);
  
  // Add to piece
  piece.add(textMesh);
  
  // Store reference
  piece.userData.textMesh = textMesh;
  textMeshes.push(textMesh);
}