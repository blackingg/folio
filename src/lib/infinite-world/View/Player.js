import { AxesHelper, CapsuleGeometry, Color, ConeGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three';

import Game from '../Game.js'
import View from './View.js'
import Debug from '../Debug/Debug.js'
import State from '../State/State.js'
import PlayerMaterial from './Materials/PlayerMaterial.js'

export default class Player
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.view = View.getInstance()
        this.debug = Debug.getInstance()

        this.scene = this.view.scene

        this.setGroup()
        this.setHelper()
        this.setDebug()
    }

    setGroup()
    {
        this.group = new Group()
        this.scene.add(this.group)
    }
    
    setHelper()
    {
        this.helper = new Mesh()
        this.helper.material = new PlayerMaterial()
        this.helper.material.uniforms.uColor.value = new Color('#fff8d6')
        this.helper.material.uniforms.uSunPosition.value = new Vector3(- 0.5, - 0.5, - 0.5)

        this.helper.geometry = new CapsuleGeometry(0.5, 0.8, 3, 16),
        this.helper.geometry.translate(0, 0.9, 0)
        this.group.add(this.helper)

        // const arrow = new Mesh(
        //     new ConeGeometry(0.2, 0.2, 4),
        //     new MeshBasicMaterial({ color: 0xffffff, wireframe: false })
        // )
        // arrow.rotation.x = - Math.PI * 0.5
        // arrow.position.y = 1.5
        // arrow.position.z = - 0.5
        // this.helper.add(arrow)
        
        // // Axis helper
        // this.axisHelper = new AxesHelper(3)
        // this.group.add(this.axisHelper)
    }

    setDebug()
    {
        if(!this.debug.active)
            return

        // Sphere
        const playerFolder = this.debug.ui.getFolder('view/player')

        playerFolder.addColor(this.helper.material.uniforms.uColor, 'value')
    }


    update()
    {
        const playerState = this.state.player
        const sunState = this.state.sun
        const dayState = this.state.day

        this.group.position.set(
            playerState.position.current[0],
            playerState.position.current[1],
            playerState.position.current[2]
        )
        
        // Helper
        this.helper.rotation.y = playerState.rotation
        this.helper.material.uniforms.uSunPosition.value.set(sunState.position.x, sunState.position.y, sunState.position.z)
        this.helper.material.uniforms.uDayCycleProgress.value = dayState.progress
    }
}
