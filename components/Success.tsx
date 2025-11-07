
import { useState, useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"

function Success() {
    const [scale, setScale] = useState(1);
    useEffect(() => {
        const interval = setInterval(() => {
            setScale(prev => (prev === 1 ? 1.2 : 1));
        }, 300);
        return () => clearInterval(interval);
    }, []);


    return (
        <View>
            <View style={styles.successBox}>
                <View style={[styles.successCircle, { transform: [{ scale }] }]} />
                <Text style={styles.successText}>Payment completed successfully!</Text>
            </View>
        </View>
    );
}

export default Success

const styles = StyleSheet.create({
    successBox: {
        alignItems: 'center',
        justifyContent: 'center',
        // marginVertical: 24,
        backgroundColor: '#34C759',
        borderRadius: 16,
        width: "90%",
        height: 340,
        padding: 16
    },
    successCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Manrope-Regular',
    }
});