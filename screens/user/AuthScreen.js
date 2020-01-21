import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView , Button} from 'react-native';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import Colors from '../../constants/Colors';


const AuthScreen = props => {

    return <KeyboardAvoidingView 
                behavior="padding"
                keyboardVerticalOffset={50}
                style={styles.screen}>
        <Card style={styles.authContainer}>
            <ScrollView>
                <Input  
                    id="email"
                    label="E-mail"
                    keyboardType="email-address"
                    required
                    email
                    initialValue=""
                    autoCapitalize="none"
                    errorMessage="Please enter a valid email."
                    onValueChange={() => {}}
                />
                <Input  
                    id="password"
                    label="Password"
                    keyboardType="default"
                    required
                    secureTextEntry
                    initialValue=""
                    minLength={5}
                    autoCapitalize="none"
                    errorMessage="Please enter a valid password."
                    onValueChange={() => {}}
                />
                <Button title="Login" color={Colors.accent} onPress={() => {}}/>
                <Button title="Switch to Sign up" color={Colors.accent} onPress={() => {}}/>
                
            </ScrollView>
        </Card>
    </KeyboardAvoidingView>
}

const styles = StyleSheet.create({

});

export default AuthScreen;

