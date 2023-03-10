import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import './style.css'
import * as dat from 'dat.gui'
import { PlaneGeometry } from 'three'
import gsap from 'gsap'

const gui = new dat.GUI()

const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50,
  },
}

gui.add(world.plane, 'width', 1, 600).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 600).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane)

const initialColor = {
  r: 0,
  g: 0.19,
  b: 0.4,
}

function generatePlane() {
  planeMesh.geometry.dispose()

  planeMesh.geometry = new PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  )

  const planeAttrs = planeMesh.geometry.attributes as any
  const planeMeshPos = planeAttrs.position
  const { array } = planeMeshPos
  const randomValues: number[] = []
  
  for (let i = 0; i < array.length; i += 3) {
    array[i] += (Math.random() - 0.5) * 3
    array[i + 1] += (Math.random() - 0.5) * 3
    array[i + 2] += (Math.random() - 0.5) * 3
  
    randomValues.push(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    )
  }
  
  planeMeshPos.originalPosition = array
  planeMeshPos.randomValues = randomValues
  
  const colors = []
  
  for (let i = 0; i < planeMeshPos.count; i++) {
    colors.push(initialColor.r, initialColor.g, initialColor.b)
  }
  
  planeMesh.geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  )
  
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
)

const renderer = new THREE.WebGLRenderer()

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)
new OrbitControls(camera, renderer.domElement)

camera.position.z = 50

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
)

const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  // @ts-ignore
  flatShading: THREE.FlatShading,
  vertexColors: true,
})

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
generatePlane()

const raycaster = new THREE.Raycaster()

scene.add(planeMesh)


const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 1, 1)
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff, 1)
backLight.position.set(0, 0, -1)
scene.add(backLight)

const mouse = {
  x: undefined,
  y: undefined,
} as any

function updateColor(color: any, face: THREE.Face, hoverColor: any) {
  // vertex 1
  color.setX(face.a, hoverColor.r)
  color.setY(face.a, hoverColor.g)
  color.setZ(face.a, hoverColor.b)

  // vertex 2
  color.setX(face.b, hoverColor.r)
  color.setY(face.b, hoverColor.g)
  color.setZ(face.b, hoverColor.b)

  // vertex 3
  color.setX(face.c, hoverColor.r)
  color.setY(face.c, hoverColor.g)
  color.setZ(face.c, hoverColor.b)

  color.needsUpdate = true
}

let frame = 0
function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  frame += 0.01

  
  const planeAttrs = planeMesh.geometry.attributes as any
  const planeMeshPos = planeAttrs.position

  const { array, originalPosition, randomValues } = planeMeshPos

  for (let i = 0; i < array.length; i += 3) {
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01

    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.01
  }

  planeMeshPos.needsUpdate = true

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(planeMesh)
  if (intersects.length > 0) {
    const object = intersects[0].object as any
    const geometry = object.geometry
    const face = intersects[0].face!
    const { color } = geometry.attributes

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    }

    updateColor(color, face, hoverColor)

    gsap.to(hoverColor, {
      ...initialColor,
      onUpdate() {
        updateColor(color, face, hoverColor)
      },
    })
  }
}

animate()

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1
  mouse.y = -(event.clientY / innerHeight) * 2 + 1
})
