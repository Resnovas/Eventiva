import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { theme } from '../theme/tokens';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const cameraRef = useRef<Camera>(null);

  useState(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  });

  const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
    if (data) {
      onScan(data);
    }
  }, [onScan]);

  const toggleCameraFacing = useCallback(() => {
    setCameraType(prev => prev === 'back' ? 'front' : 'back');
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => Alert.alert('Permission required', 'Grant camera access in settings')}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        type={cameraType}
        style={styles.camera}
        onBarCodeScanned={handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ['qr'],
        }}
      >
        <View style={styles.scannerOverlay}>
          <View style={styles.scanArea} />
        </View>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.buttonText}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 200,
    height: 200,
    borderColor: theme.colors.primary,
    borderWidth: 2,
    borderRadius: theme.borderRadius.lg,
    opacity: 0.3,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  buttonText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  text: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    padding: theme.spacing.md,
  },
});
