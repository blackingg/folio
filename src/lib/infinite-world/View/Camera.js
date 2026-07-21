import { Group, PerspectiveCamera } from 'three';

import Game from '../Game.js'
import View from './View.js'
import State from '../State/State.js'

export default class Camera
{
    constructor(_options)
    {
        // Options
        this.state = State.getInstance()
        this.view = View.getInstance()
        this.scene = this.view.scene
        this.viewport = this.state.viewport

        this.setInstance()
    }

    setInstance()
    {
        // Set up
        this.instance = new PerspectiveCamera(45, this.viewport.width / this.viewport.height, 0.1, Game.getInstance()?.quality?.cameraFar ?? 5000)
        this.instance.rotation.reorder('YXZ')

        // XR rig — locomotion and snap turns move the rig while the headset
        // poses the camera inside it. On desktop the rig stays at identity,
        // so the per-frame pose copy behaves exactly as before.
        this.rig = new Group()
        this.rigYaw = 0
        this.rig.add(this.instance)

        this.scene.add(this.rig)
    }

    resize()
    {
        // The XR session owns projection while presenting
        if(this.view.renderer?.instance.xr.isPresenting)
            return

        this.instance.aspect = this.viewport.width / this.viewport.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        const playerSate = this.state.player

        if(this.view.renderer?.instance.xr.isPresenting)
        {
            // First person: rig origin sits on the terrain at the player's
            // feet ('local-floor' puts the HMD at real head height above it);
            // renderer.xr drives the camera pose, so don't copy it.
            this.rig.position.set(
                playerSate.position.current[0],
                playerSate.position.current[1],
                playerSate.position.current[2]
            )
            this.rig.rotation.y = this.rigYaw
            return
        }

        this.rig.position.set(0, 0, 0)
        this.rig.rotation.y = 0

        // Apply coordinates from view
        this.instance.position.set(playerSate.camera.position[0], playerSate.camera.position[1], playerSate.camera.position[2])
        this.instance.quaternion.set(playerSate.camera.quaternion[0], playerSate.camera.quaternion[1], playerSate.camera.quaternion[2], playerSate.camera.quaternion[3])
        // this.instance.updateMatrixGame() // To be used in projection
    }

    destroy()
    {
    }
}