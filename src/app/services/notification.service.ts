import { Injectable } from '@angular/core';
import iziToast from 'izitoast';

// Define the position types manually since they're not in the typings
type ToastPosition = 
  'bottomRight' | 'bottomLeft' | 
  'topRight' | 'topLeft' | 
  'topCenter' | 'bottomCenter' | 
  'center';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor() {
    // Default settings
    iziToast.settings({
      timeout: 5000,
      position: 'topRight', // default position
      transitionIn: 'fadeInDown',
      transitionOut: 'fadeOutUp',
      closeOnClick: true,
       zindex: 99999, // Explicitly set z-index
    });
  }

  // Test different positions
  testPositions() {
    const positions: ToastPosition[] = [
      'bottomRight',
      'bottomLeft',
      'topRight',
      'topLeft',
      'topCenter',
      'bottomCenter',
      'center'
    ];

    positions.forEach((position, index) => {
      setTimeout(() => {
        iziToast.info({
          title: 'Position Test',
          message: `This toast is positioned at ${position}`,
          position: position,
          timeout: 4000
        });
      }, index * 1000); // Stagger them by 1 second
    });
  }

  // Your existing methods with position parameter added
  success(message: string, title: string = 'Success', position?: ToastPosition) {
    iziToast.success({ 
      title, 
      message,
      position: position || 'topRight' // Use provided position or default
    });
  }

  error(message: string, title: string = 'Error', position?: ToastPosition) {
    iziToast.error({ 
      title, 
      message,
      position: position || 'topRight'
    });
  }

  info(message: string, title: string = 'Info', position?: ToastPosition) {
    iziToast.info({ 
      title, 
      message,
      position: position || 'topRight'
    });
  }

  warning(message: string, title: string = 'Warning', position?: ToastPosition) {
    iziToast.warning({ 
      title, 
      message,
      position: position || 'topRight'
    });
  }
}