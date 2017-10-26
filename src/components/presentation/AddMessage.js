import React, { Component } from 'react'
import { TouchableOpacity, Image, StyleSheet, View, TextInput, Text } from 'react-native'
import config from '../../config'
import Turbo from 'turbo360'
import ImagePicker from 'react-native-image-picker'

class AddMessage extends Component{

    constructor(){
        super()
        this.state = {
            showInputs: false,
            message: {
                for:'',
                text: ''
            }
        }
    }

    messageUpdated(text, key){
        let newMessage = Object.assign({}, this.state.message)
        newMessage[key] = text
        this.setState({
            message: newMessage
        })
    }

    attachPhoto(){
        var options = {
            title: 'Select Image to Share!',
            storageOptions: {
              skipBackup: true,
              path: 'images'
            }
          };
          ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);
            let file = {uri: response.uri, name: 'image.jpg', type: 'image/jpg'}         
            Turbo({site_id: config.TURBO_APP_ID}).uploadFile(file)
            .then(response=>{
                console.log(JSON.stringify(response))
            })
            .catch(err=>{
                console.log(err.message)
            })
          })
        
    }

    toggle(){
        if(this.state.showInputs){
            this.sendMessage()
        }
        this.setState({
            showInputs: !this.state.showInputs
        })
    }

    sendMessage(){
        Turbo({site_id: config.TURBO_APP_ID})
        .create('message', {for: this.state.message.for, from:this.props.currentUser, content: this.state.message.text})

        .then((data)=>{
            alert('Message Sent successfully')
        })
        .catch((err)=>{
            alert(err.message)
        })
    }

    render(){

        const buttonType = (this.state.showInputs) ? config.images.send : config.images.plus

        return(
            <View>
                {
                    (this.state.showInputs) ?
                        <View style={styles.inputSection}>
                            <View style={styles.inputRow}>
                                <Text>For</Text>
                                <TextInput onChangeText={(text)=>{this.messageUpdated(text, 'for')}}/>
                            </View>
                            <View>
                                <Text>Message</Text>
                                <TextInput onChangeText={(text)=>{this.messageUpdated(text, 'text')}}/>
                            </View>
                        </View>
                    :
                    null
                }{ (this.state.showInputs) ? 
                    <TouchableOpacity
                        onPress={()=>{this.attachPhoto()}}
                        style={styles.camera}>
                        <Image style={{width:30, height:30}}
                            source={config.images.camera}/>
                    </TouchableOpacity>                   
                    :
                    null
                }
                <TouchableOpacity
                    onPress={()=>{this.toggle()}}
                    style={styles.circle}>
                    <Image style={{width:40, height:40}}
                        source={buttonType}/>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    circle: {
        width:70,
        height:70,
        borderRadius:35,
        backgroundColor: 'rgb(98,195,112)',
        position:'absolute',
        bottom:15,
        right:15,
        alignItems:'center',
        justifyContent:'center'
    },
    camera: {
        width:60,
        height:60,
        borderRadius:30,
        backgroundColor: 'rgb(226,96,83)',
        position:'absolute',
        bottom:90,
        right:20,
        alignItems:'center',
        justifyContent:'center'
    },
    inputSection: {
        backgroundColor: 'red'
    },
    inputRow: {

    }
})

export default AddMessage