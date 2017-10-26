import React, { Component } from 'react'
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Modal, TextInput, Image } from 'react-native'
import { AddMessage } from '../presentation'
import Turbo from 'turbo360'
import config from '../../config'

class Messages extends Component{

    constructor(){
        super()
        this.state = {
            messages: [
            ],
            modalVisible: true,
            modalContent: 'login', // login || message || ??
            login: {
                username:'',
                password:''
            },
            currentUser: null,
            activeMessage: null
        }
    }

    loginUpdated(text, key){
        let newLogin = Object.assign({}, this.state.login)
        newLogin[key] = text
        this.setState({
            login: newLogin
        })
    }

    loginSubmitted(){
        let message = null
        Turbo({site_id: config.TURBO_APP_ID}).fetch('user', {username: this.state.login.username})
        .then((data=>{
            if(data.length==0){
                message = "Register success: "
                return Turbo({site_id: config.TURBO_APP_ID}).createUser(this.state.login)
            }else{
                message = "Login success: "
                return Turbo({site_id: config.TURBO_APP_ID}).login(this.state.login)
            }
        }))
        .then((data)=>{
            this.setState({
                currentUser: data.username
            })
            return Turbo({site_id: config.TURBO_APP_ID}).fetch('message', {for:data.username})
        })
        .then((messages)=>{
            this.setState({
                modalVisible: false,
                messages: messages,
                modalContent: 'message'
            })
        })
        .catch((err)=>{
            alert(err.message)
        })
    }

    openMessage(item){
        this.setState({
            modalVisible: true,
            activeMessage: item
        })
    }

    messageRead(){
        Turbo({site_id: config.TURBO_APP_ID}).remove('message', this.state.activeMessage)
        .then((data)=>{
            let newMessages = []
            this.state.messages.forEach((message, i)=>{
                if(message.id!==data.id){
                    newMessages.push(message)
                }
            })
            this.setState({
                messages: newMessages,
                modalVisible: false
            })
        })
        .catch((err)=>{
            alert(err.message)
        })
    }

    _renderMessage(item){
        return(
            <TouchableOpacity
                onPress={()=>this.openMessage(item)}
                activeOpacity={1}
                style={styles.message}>
                <Text style={[{paddingTop:5}, styles.messageText]}>
                    From: {item.from}
                </Text>
                <Text style={[{paddingBottom:5}, styles.messageText]}>
                    {item.content}
                </Text>
            </TouchableOpacity>
        )
    }

    render(){
        return(
            <View style={styles.main}>
                <Modal
                    transparent={true} 
                    visible={this.state.modalVisible}>
                    <View style={styles.modal}>
                        { 
                            (this.state.modalContent==='login') ?
                                <View style={styles.login}>
                                    <Text>Login / Signup</Text>
                                    <Text>Username</Text>
                                    <TextInput onChangeText={(text)=>this.loginUpdated(text, 'username')}/>
                                    <Text>Password</Text>
                                    <TextInput onChangeText={(text)=>this.loginUpdated(text, 'password')}/>
                                    <TouchableOpacity onPress={()=>this.loginSubmitted()}>
                                        <Text>SUBMIT</Text>
                                    </TouchableOpacity>
                                </View>
                            :
                            <View style={styles.messageExpanded}>
                                <TouchableOpacity onPress={()=>this.messageRead()}>
                                    <Image source={config.images.close} />
                                    <View>
                                        {
                                            (this.state.activeMessage!=null) ?
                                                <View>
                                                    <Text>Make sure you read your message you can only open once</Text>
                                                    <Text>{this.state.activeMessage.from}</Text>
                                                    <Text>{this.state.activeMessage.content}</Text>
                                                </View>
                                            :
                                                null
                                        }

                                    </View>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                </Modal>
                <FlatList
                    keyExtractor={(item)=>item.id}
                    data={this.state.messages}
                    renderItem={({item})=>this._renderMessage(item)}
                    />
                    <AddMessage currentUser={this.state.currentUser}/>
            </View>
        )
    }
}

const styles=StyleSheet.create({
    main:{
        width:100+'%', 
        height:100+'%'
    },
    message:{
        width:100+'%',
        borderBottomWidth:1,
        borderColor:'rgb(71,77,89)'
    },
    messageText:{
        color:'rgb(12,0,51)',
        fontFamily:'helvetica',
        fontSize:14
    },
    modal: {
        width:100+'%',
        height:100+'%',
        backgroundColor:'rgba(0,0,0,.85)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    login: {
        width:80+'%',
        height:30+'%',
        backgroundColor: 'rgb(255,255,255)'
    },
    messageExpanded: {
        width:90+'%',
        height:90+'%',
        backgroundColor: 'rgb(255,255,255)'
    }
})

export default Messages