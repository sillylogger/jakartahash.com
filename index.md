---
layout: default
title: Home
description: Jakarta Hash House Harriers is a global running and social club combining elements of running, orienteering, and socializing in Jakarta, Indonesia.
---

<!-- LightWidget WIDGET -->
<script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
<iframe src="https://cdn.lightwidget.com/widgets/092292fcf3df5d78bf8908c85198582b.html"
        scrolling="no"
        allowtransparency="true"
        class="lightwidget-widget"
        style="width:100%;border:0;overflow:hidden;"></iframe>
<script>
document.addEventListener('DOMContentLoaded', function() {
    let currentPostId = null; // Track which post we're viewing

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.className && node.className.includes('lightwidget__lightbox')) {
                    console.log('Lightbox detected! Enhancing...');
                    enhanceLightbox(node);

                    // Watch for navigation changes
                    watchLightboxChanges(node);
                }
            });
        });
    });

    function watchLightboxChanges(lightbox) {
        const lightboxObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Watch for lightbox being shown (class change)
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'class' &&
                    mutation.target === lightbox) {

                    // If lightbox is now visible (hidden class removed), re-enhance
                    if (!lightbox.classList.contains('lightwidget__lightbox--hidden')) {
                        console.log('Lightbox reopened, re-enhancing...');
                        currentPostId = null; // Reset so we re-process
                        setTimeout(() => enhanceLightbox(lightbox), 100);
                    }
                }

                // Watch for image src changes (indicates navigation to new post)
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'src' &&
                    mutation.target.classList.contains('lightwidget__lightbox-image')) {

                    const newSrc = mutation.target.src;
                    console.log('Image changed to:', newSrc);

                    // Extract a unique identifier from the image URL
                    const newPostId = extractPostIdFromSrc(newSrc);

                    if (newPostId && newPostId !== currentPostId) {
                        currentPostId = newPostId;
                        console.log('New post detected, re-enhancing...');
                        setTimeout(() => enhanceLightbox(lightbox), 100);
                    }
                }
            });
        });

        lightboxObserver.observe(lightbox, {
            attributes: true,
            attributeFilter: ['src', 'class'],
            subtree: true
        });
    }

    function extractPostIdFromSrc(src) {
        // Extract a unique part of the Instagram image URL
        const match = src.match(/\/([^\/]+)\.heic/);
        return match ? match[1] : src.substring(src.length - 20);
    }

    function enhanceLightbox(lightbox) {
        // Adjust layout first
        adjustLightboxLayout(lightbox);

        // Wait a moment for lightbox content to fully load
        setTimeout(() => {
            const caption = lightbox.querySelector('.lightwidget__lightbox-caption');
            if (caption) {
                // Check if this specific caption content was already enhanced
                const captionText = caption.textContent || '';
                const isAlreadyEnhanced = caption.querySelector('a[href*="wa.me"]') ||
                                        caption.querySelector('a[target="_blank"]');

                if (isAlreadyEnhanced) {
                    console.log('Caption already enhanced, skipping...');
                    return;
                }

                console.log('Found lightbox caption, enhancing...');

                // Make caption text selectable
                caption.style.userSelect = 'text';
                caption.style.webkitUserSelect = 'text';
                caption.style.cursor = 'text';
                caption.style.padding = '20px';
                caption.style.fontSize = '14px';
                caption.style.lineHeight = '1.6';

                // Find and enhance URLs and phone numbers
                enhanceURLsAndPhoneInCaption(caption);

                console.log('Lightbox caption enhanced!');
            }
        }, 150);
    }

    function adjustLightboxLayout(lightbox) {
        const dialog = lightbox.querySelector('.lightwidget__lightbox-dialog');
        if (!dialog) return;

        const isMobile = window.innerWidth < 640;

        // Base dialog styles
        dialog.style.display = 'flex';
        dialog.style.flexDirection = isMobile ? 'column' : 'row';
        dialog.style.width = isMobile ? '95vw' : '90vw';
        dialog.style.maxWidth = isMobile ? '100%' : '1200px';
        dialog.style.height = isMobile ? 'auto' : '80vh';
        dialog.style.maxHeight = isMobile ? '90vh' : '800px';

        const preloader = dialog.querySelector('.lightwidget__lightbox-preloader');
        const details = dialog.querySelector('.lightwidget__lightbox-details');

        if (preloader && details) {
            if (isMobile) {
                // Mobile: image on top, constrained height
                preloader.style.flex = '0 0 auto';
                preloader.style.width = '100%';
                preloader.style.maxHeight = '40vh';
                preloader.style.height = 'auto';

                // Caption below, scrollable
                details.style.flex = '1';
                details.style.width = '100%';
                details.style.overflow = 'auto';
                details.style.height = 'auto';
            } else {
                // Desktop: side by side (40% image / 60% caption)
                preloader.style.flex = '0 0 40%';
                preloader.style.height = '100%';
                preloader.style.maxHeight = '';
                preloader.style.width = '';

                details.style.flex = '1';
                details.style.height = '100%';
                details.style.overflow = 'auto';
                details.style.width = '';
            }

            // Shared preloader styles
            preloader.style.display = 'flex';
            preloader.style.alignItems = 'center';
            preloader.style.justifyContent = 'center';

            // Image styling
            const img = preloader.querySelector('.lightwidget__lightbox-image');
            if (img) {
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
            }

            // Details styling
            details.style.padding = '20px';
            details.style.display = 'flex';
            details.style.flexDirection = 'column';
        }
    }

    function enhanceURLsAndPhoneInCaption(caption) {
        console.log('Original caption content:', caption.innerHTML);

        let text = caption.innerHTML;

        // Regex to find URLs (that aren't already links)
        const urlRegex = /(?<!href="|href=')https?:\/\/[^\s<>\(\)]+(?![^<]*<\/a>)/g;

        // Regex to find phone numbers that aren't already enhanced
        const phoneRegex = /(?<!📱\s)(\b0\d{9,12}\b|\+62\d{9,12})(?![^<]*<\/a>)/g;

        // Replace URLs with clickable links
        text = text.replace(urlRegex, function(url) {
            console.log('Found URL:', url);
            return `<a href="${url}" target="_blank" style="color: #007bff !important; text-decoration: underline !important; font-weight: bold !important; cursor: pointer !important;">${url}</a>`;
        });

        // Replace phone numbers with WhatsApp links
        text = text.replace(phoneRegex, function(phone) {
            console.log('Found phone:', phone);
            // Convert to international format for WhatsApp
            let whatsappNumber = phone;
            if (phone.startsWith('0')) {
                whatsappNumber = '+62' + phone.substring(1);
            }
            // Remove any spaces or special characters
            whatsappNumber = whatsappNumber.replace(/\s+/g, '');

            return `<a href="https://wa.me/${whatsappNumber}" target="_blank" style="color: #25D366 !important; text-decoration: underline !important; font-weight: bold !important; cursor: pointer !important;" title="WhatsApp ${phone}">📱 ${phone}</a>`;
        });

        caption.innerHTML = text;
        console.log('URLs and phone numbers enhanced!');
    }

    observer.observe(document.body, { childList: true, subtree: true });

    console.log('Enhanced lightbox script loaded');
});
</script>
