
import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

import { balance } from "../service/client"

const divisor = Math.pow(10, 8);

const ReadModal = ({ onClose }) => {
    const [data, setData] = useState(null)


    useEffect(() => {
        const readTag = async () => {
            try {
                await NfcManager.start()
                await NfcManager.requestTechnology(NfcTech.Ndef);
                const tag = await NfcManager.getTag()
                if (tag?.id) {
                    const result = await balance(tag.id)
                    setData(result)
                } else {
                    console.error("Deu ruim")
                }
            } catch (e) {
                console.error(e)
                onClose()
            }
        }

        setTimeout(() => {
            readTag()
        }, 300)

        return () => {
            NfcManager.cancelTechnologyRequest()
        }
    }, [])


    return (
        <View style={styles.qrModalCentered}>
            {data
                ? (
                    <View style={styles.qrBox}>
                        <Text style={styles.qrTitle}>Card Details</Text>
                        <Text
                            style={{ fontSize: 18, color: '#181A20', marginBottom: 8 }}
                        >
                            <Text style={{ fontWeight: 'bold' }}>User ID:</Text>
                            {data?.cardId}
                        </Text>
                        <Text
                            style={{ fontSize: 18, color: '#181A20', marginBottom: 18 }}
                        >
                            <Text style={{ fontWeight: 'bold' }}>Balance: </Text>
                            R$ {data?.balance?.toFixed(2)}
                        </Text>

                        <Text
                            style={{ fontSize: 18, color: '#181A20', marginBottom: 18 }}
                        >
                            <Text style={{ fontWeight: 'bold' }}>Crypto: </Text>
                            {(data?.crypto / divisor).toFixed(8)}
                        </Text>

                        <TouchableOpacity
                            style={styles.qrButton}
                            onPress={() => onClose()}
                        >
                            <Text style={styles.qrButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                )
                : (
                    <View style={styles.qrBox}>
                        <Text style={styles.qrTitle}>Tap card to check balance</Text>
                        <Text
                            style={{
                                fontSize: 16,
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
                )}
        </View >
    )
}

export default ReadModal

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

    },
    qrBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
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
    qrButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    qrButton: {
        backgroundColor: '#161616',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 32,
        width: '100%',
    },
});