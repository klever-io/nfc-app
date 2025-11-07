
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

import Success from "./Success"
import LoadingDots from "./LoadingDots"

import { pay } from "../service/client"

const Reading = () => (
    <View style={{ padding: 16 }}>
        <Text style={styles.qrTitle}>Tap card for parking payment</Text>
        <Text
            style={{
                fontSize: 18,
                color: '#181A20',
                marginBottom: 18,
                textAlign: 'center',
            }}
        >
            The card is being read...
        </Text>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 40 }}>🅿️📲</Text>
        </View>
    </View>
)

const Pending = () => (
    <View style={styles.loadingBox}>
        <Text style={styles.loadingText}>Payment is being processed...</Text>
        <LoadingDots />
    </View>
)

const Failure = ({ onClose }) => (
    <View style={styles.failureBox}>
        <Text style={styles.failureTitle}>Transaction Failed</Text>
        <Text style={styles.failureMessage}>Error when try to pay</Text>
        <TouchableOpacity
            style={styles.failureButton}
            onPress={() => { onClose() }}
        >
            <Text style={styles.failureButtonText}>Close</Text>
        </TouchableOpacity>
    </View>
)

const States = {
    reading: Reading,
    pending: Pending,
    success: Success,
    failure: Failure
}

const wait = (time) => new Promise((res) => setTimeout(res, time))

const Parking = ({ onClose }) => {
    const [data, setData] = useState("reading")

    useEffect(() => {
        const readTag = async () => {
            try {
                await NfcManager.start()
                await NfcManager.requestTechnology(NfcTech.IsoDep);
                const tag = await NfcManager.getTag()
                console.log("Tag ", tag)
                if (tag?.id) {
                    setData("pending")
                    await wait(300)
                    const result = await pay(tag.id)
                    console.log("result")
                    setData("success")
                    await wait(800)
                    onClose()
                } else {
                    console.error("Deu ruim")
                    setData("failure")
                }
            } catch (e) {
                console.error(e)
            }
        }

        readTag()

        return () => {
            NfcManager.cancelTechnologyRequest()
        }
    }, [])


    const Component = States[data] ?? States.reading

    return (
        <View style={styles.qrModalCentered}>
            <View style={styles.qrBox}>
                <Component onClose={onClose} />
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    qrModalCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        backgroundColor: "transparent"
    },
    qrBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        alignItems: 'center',
        minWidth: 280,
        maxWidth: 340,
    },
    qrTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#181A20',
        marginBottom: 18,
        textAlign: 'center',
    },
    failureBox: {
        backgroundColor: '#FF3B30',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        minWidth: 280,
        maxWidth: 340,
    },
    failureTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    failureMessage: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 18,
        textAlign: 'center',
    },
    failureButton: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 32,
        width: '100%',
    },
    failureButtonText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loadingBox: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        width: '100%',
    },
    loadingText: {
        fontSize: 18,
        marginBottom: 8,
        fontFamily: 'Manrope-Regular',
    },
});


export default Parking