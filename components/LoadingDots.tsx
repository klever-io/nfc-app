
import { useState, useEffect } from "react"
import { Text, StyleSheet } from "react-native"

function LoadingDots() {
    const [dotCount, setDotCount] = useState(1);


    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount(prev => (prev === 3 ? 1 : prev + 1));
        }, 400);
        return () => clearInterval(interval);
    }, []);


    return <Text style={styles.loadingText}>{'.'.repeat(dotCount)}</Text>;
}

export default LoadingDots

const styles = StyleSheet.create({
    loadingText: {
        fontSize: 48,
        marginBottom: 8,
        fontFamily: 'Manrope-Regular',
    },
});
