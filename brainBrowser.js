/**
 * Brain Browser - A proof of concept for visualizing browsing as a neural network
 * 
 * This JavaScript file implements the core functionality for the Brain Browser concept,
 * including neuron creation, synapse formation, and tab management.
 */

import { mockPages, mockPageUrls } from './mockData.js';

// Main application class
class BrainBrowser {
    constructor() {
        // Configuration settings
        this.config = {
            // Neuron appearance
            neuronSize: 60,
            neuronGrowAnimation: true,
            neuronGrowDuration: 500,
            
            // Synapse appearance
            synapseWidth: 2,
            synapseOpacity: 0.5,
            synapseAnimationDuration: 8, // seconds
            pulseAnimationDuration: 1.5, // seconds
            
            // Clustering
            clusteringEnabled: true,
            clusteringMaxDistance: 10,
            
            // Performance
            maxVisibleNeurons: 100, // future feature for optimization
            maxVisibleSynapses: 200, // future feature for optimization
            
            // Logging
            logLevel: 'debug', // 'debug', 'info', 'warn', 'error', 'none'
            trackUserInteractions: true,
            performanceMonitoring: true,
            trackFrameRate: true,
            neuronAnimation: 'pulse', // none, pulse, glow, etc.
            showDebugInfo: false,
        };
        
        // Known sites that block iframe embedding with X-Frame-Options
        this.knownXFrameBlockedSites = [
            'google.com',
            'facebook.com',
            'instagram.com',
            'twitter.com',
            'netflix.com',
            'amazon.com',
            'youtube.com',
            'linkedin.com',
            'github.com',
            'microsoft.com',
            'apple.com',
            'yahoo.com',
            'bankofamerica.com',
            'chase.com',
            'wellsfargo.com',
            'paypal.com'
        ];
        
        // Performance metrics
        this.performanceMetrics = {
            frameRates: [],
            renderTimes: [],
            interactionLatencies: []
        };
        
        // User interaction log
        this.interactionLog = [];
        
        // DOM Elements
        this.neuralNetwork = document.getElementById('neural-network');
        this.tabBar = document.getElementById('tab-bar');
        this.contentDisplay = document.getElementById('content-display');
        this.urlInput = document.getElementById('url-input');
        
        // Templates
        this.neuronTemplate = document.getElementById('neuron-template');
        this.synapseTemplate = document.getElementById('synapse-template');
        this.tabTemplate = document.getElementById('tab-template');
        this.pageTemplate = document.getElementById('page-template');
        
        // Button references
        this.newTabBtn = document.getElementById('new-tab-btn');
        this.goBtn = document.getElementById('go-btn');
        this.zoomInBtn = document.getElementById('zoom-in-btn');
        this.zoomOutBtn = document.getElementById('zoom-out-btn');
        this.resetViewBtn = document.getElementById('reset-view-btn');
        const debugBtn = document.getElementById('debug-btn');
        if (debugBtn) {
            this.debugBtn = debugBtn;
        }
        
        // Minimap elements
        this.minimap = document.getElementById('minimap');
        this.minimapViewport = document.getElementById('minimap-viewport');
        
        // State
        this.neurons = {};         // neuronId -> neuron element
        this.synapses = {};        // fromId_toId -> synapse element
        this.tabs = {};            // tabId -> tab data
        this.pages = {};           // pageId -> page element
        this.pageNeurons = {};     // pageId -> neuronId
        this.minimapNeurons = {};  // neuronId -> minimap neuron element
        this.minimapSynapses = {}; // synapseId -> minimap synapse element
        this.activeTabId = null;
        this.lastTabId = 0;
        this.lastNeuronId = 0;
        this.brainScale = 1;
        this.brainPosition = { x: 0, y: 0 };
        this.isDragging = false;
        this.isDraggingNeuron = false;
        this.dragStartPosition = null;
        
        // Initial setup
        this.initEventListeners();
        
        // Start performance monitoring if enabled
        if (this.config.performanceMonitoring) {
            this.initPerformanceMonitoring();
        }
        
        // Load saved state if available
        this.loadFromLocalStorage();
    }
    
    /**
     * Log a message or interaction based on the current log level
     */
    log(level, message, data = null) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };
        const configLevelValue = levels[this.config.logLevel];
        const messageLevelValue = levels[level];
        
        // Only log if the message level is >= the configured level
        if (messageLevelValue >= configLevelValue) {
            const logData = {
                timestamp: new Date().toISOString(),
                level,
                message,
                data
            };
            
            // Add to interaction log if tracking is enabled
            if (this.config.trackUserInteractions) {
                this.interactionLog.push(logData);
                
                // Prevent the log from growing too large
                if (this.interactionLog.length > 1000) {
                    this.interactionLog.shift();
                }
            }
            
            // Log to console with appropriate method
            if (level === 'debug') console.debug(message, data || '');
            else if (level === 'info') console.log(message, data || '');
            else if (level === 'warn') console.warn(message, data || '');
            else if (level === 'error') console.error(message, data || '');
        }
    }
    
    /**
     * Record a performance measurement
     */
    recordPerformance(type, value) {
        if (!this.config.performanceMonitoring) return;
        
        if (type === 'frameRate') {
            this.performanceMetrics.frameRates.push(value);
            if (this.performanceMetrics.frameRates.length > 100) {
                this.performanceMetrics.frameRates.shift();
            }
        } else if (type === 'renderTime') {
            this.performanceMetrics.renderTimes.push(value);
            if (this.performanceMetrics.renderTimes.length > 100) {
                this.performanceMetrics.renderTimes.shift();
            }
        } else if (type === 'interactionLatency') {
            this.performanceMetrics.interactionLatencies.push(value);
            if (this.performanceMetrics.interactionLatencies.length > 100) {
                this.performanceMetrics.interactionLatencies.shift();
            }
        }
    }
    
    /**
     * Initialize the animation frame for performance monitoring
     */
    initPerformanceMonitoring() {
        if (!this.config.performanceMonitoring) return;
        
        // Set up performance monitoring with requestAnimationFrame
        const performanceLoop = () => {
            const now = performance.now();
            const elapsed = now - this.performanceMetrics.lastFrameTime;
            this.performanceMetrics.lastFrameTime = now;
            
            // Calculate frame rate
            const fps = 1000 / elapsed;
            this.recordPerformance('frameRate', fps);
            
            // Continue the loop
            requestAnimationFrame(performanceLoop);
        };
        
        // Start the performance monitoring loop
        requestAnimationFrame(performanceLoop);
    }
    
    /**
     * Initialize event listeners for the UI components
     */
    initEventListeners() {
        // New tab button
        this.newTabBtn.addEventListener('click', () => {
            const startTime = performance.now();
            this.createNewTab();
            if (this.config.performanceMonitoring) {
                const latency = performance.now() - startTime;
                this.recordPerformance('interactionLatency', latency);
            }
            this.log('info', 'User created new tab');
        });
        
        // Go button for URL navigation
        this.goBtn.addEventListener('click', () => {
            const startTime = performance.now();
            this.navigateToUrl();
            if (this.config.performanceMonitoring) {
                const latency = performance.now() - startTime;
                this.recordPerformance('interactionLatency', latency);
            }
            this.log('info', 'User navigated by URL', { url: this.urlInput.value });
        });
        
        // URL input enter key
        this.urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.navigateToUrl();
        });
        
        // Zoom controls
        this.zoomInBtn.addEventListener('click', () => this.zoomBrain(0.1));
        this.zoomOutBtn.addEventListener('click', () => this.zoomBrain(-0.1));
        this.resetViewBtn.addEventListener('click', () => this.resetBrainView());
        
        // Debug button
        if (this.debugBtn) {
            this.debugBtn.addEventListener('click', () => this.toggleDebugView());
        }
        
        // Brain drag functionality
        this.neuralNetwork.addEventListener('mousedown', (e) => this.startDragging(e));
        document.addEventListener('mousemove', (e) => this.dragBrain(e));
        document.addEventListener('mouseup', () => this.stopDragging());
        
        // Link click handling for mock navigation
        this.contentDisplay.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.dataset.pageId) {
                e.preventDefault();
                
                // Check if it's a right-click or CTRL+click to open in a new tab
                if (e.ctrlKey || e.button === 2) {
                    // Get current active tab's neuron as the source
                    const sourcePageId = this.activeTabId ? this.tabs[this.activeTabId].pageId : null;
                    const sourceNeuronId = sourcePageId ? this.pageNeurons[sourcePageId] : null;
                    
                    // First create the new tab
                    const newTabId = this.createNewTab();
                    
                    // Then navigate to the target, passing the source neuron ID for synapse creation
                    this.navigateTo(e.target.dataset.pageId, newTabId, sourceNeuronId);
                    
                    // Log the action
                    this.log('info', 'Opened link in new tab with source connection', { 
                        sourceNeuronId, 
                        targetPageId: e.target.dataset.pageId 
                    });
                } else {
                    // Regular click, navigate in current tab
                    this.navigateTo(e.target.dataset.pageId);
                }
            }
        });
        
        // Handle context menu for links
        this.contentDisplay.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'A' && e.target.dataset.pageId) {
                e.preventDefault();
                
                const sourcePageId = this.activeTabId ? this.tabs[this.activeTabId].pageId : null;
                const sourceNeuronId = sourcePageId ? this.pageNeurons[sourcePageId] : null;
                
                const newTabId = this.createNewTab();
                this.navigateTo(e.target.dataset.pageId, newTabId, sourceNeuronId);
            }
        });
        
        // Minimap navigation
        if (this.minimap) {
            this.minimap.addEventListener('click', (e) => this.navigateFromMinimap(e));
            
            // Initialize minimap
            this.initMinimap();
        }
    }
    
    /**
     * Initialize the minimap
     */
    initMinimap() {
        // Make sure minimap is ready
        if (!this.minimap || !this.minimapViewport) return;
        
        // Update the minimap when the brain is transformed
        window.addEventListener('resize', () => this.updateMinimapViewport());
        
        // Initial update
        this.updateMinimapViewport();
    }
    
    /**
     * Update the minimap viewport to reflect the current view
     */
    updateMinimapViewport() {
        if (!this.minimap || !this.minimapViewport) return;
        
        // Calculate the visible area of the neural network
        const brainContainerRect = this.neuralNetwork.parentElement.getBoundingClientRect();
        const minimapRect = this.minimap.getBoundingClientRect();
        
        // Calculate the brain's actual size based on its current scale
        const brainWidth = this.neuralNetwork.offsetWidth * this.brainScale;
        const brainHeight = this.neuralNetwork.offsetHeight * this.brainScale;
        
        // Scale factor between minimap and brain
        const scaleX = minimapRect.width / brainWidth;
        const scaleY = minimapRect.height / brainHeight;
        
        // Calculate the position of the viewport relative to the brain (adjusted for brain position)
        const viewportLeft = (-this.brainPosition.x / this.brainScale) * scaleX;
        const viewportTop = (-this.brainPosition.y / this.brainScale) * scaleY;
        
        // Calculate the size of the viewport in minimap space
        const viewportWidth = (brainContainerRect.width / this.brainScale) * scaleX;
        const viewportHeight = (brainContainerRect.height / this.brainScale) * scaleY;
        
        // Apply the viewport position and size, ensuring it stays within minimap boundaries
        this.minimapViewport.style.width = `${Math.min(viewportWidth, minimapRect.width)}px`;
        this.minimapViewport.style.height = `${Math.min(viewportHeight, minimapRect.height)}px`;
        this.minimapViewport.style.left = `${Math.max(0, Math.min(viewportLeft, minimapRect.width - viewportWidth))}px`;
        this.minimapViewport.style.top = `${Math.max(0, Math.min(viewportTop, minimapRect.height - viewportHeight))}px`;
    }
    
    /**
     * Navigate by clicking on the minimap
     */
    navigateFromMinimap(e) {
        // Get click position relative to minimap
        const minimapRect = this.minimap.getBoundingClientRect();
        const x = e.clientX - minimapRect.left;
        const y = e.clientY - minimapRect.top;
        
        // Convert to percentage of minimap
        const percentX = x / minimapRect.width;
        const percentY = y / minimapRect.height;
        
        // Calculate the position in the brain space
        const brainWidth = this.neuralNetwork.offsetWidth;
        const brainHeight = this.neuralNetwork.offsetHeight;
        
        // Calculate the target position in brain coordinates
        const targetX = (percentX - 0.5) * brainWidth * -1;
        const targetY = (percentY - 0.5) * brainHeight * -1;
        
        // Animate the brain to this position
        this.animateBrainPosition(targetX, targetY);
    }
    
    /**
     * Animate the brain to a new position
     */
    animateBrainPosition(x, y) {
        // Set new position
        this.brainPosition = { x, y };
        
        // Apply with smooth transition
        this.neuralNetwork.style.transition = 'transform 0.5s ease';
        this.updateBrainTransform();
        
        // Clear transition after animation
        setTimeout(() => {
            this.neuralNetwork.style.transition = '';
        }, 500);
        
        // Update minimap
        this.updateMinimapViewport();
    }
    
    /**
     * Add a neuron to the minimap
     */
    addNeuronToMinimap(neuronId) {
        if (!this.minimap) return;
        
        const neuron = this.neurons[neuronId];
        if (!neuron) return;
        
        // Create minimap neuron element
        const minimapNeuron = document.createElement('div');
        minimapNeuron.className = 'minimap-neuron';
        
        // Get position from actual neuron (as percentage)
        const left = parseFloat(neuron.style.left);
        const top = parseFloat(neuron.style.top);
        
        // Position on minimap
        minimapNeuron.style.left = `${left}%`;
        minimapNeuron.style.top = `${top}%`;
        
        // Add to minimap
        this.minimap.appendChild(minimapNeuron);
        this.minimapNeurons[neuronId] = minimapNeuron;
        
        // Set the correct state for this neuron
        if (neuron.classList.contains('active')) {
            minimapNeuron.classList.add('active');
        }
        
        if (neuron.classList.contains('current')) {
            minimapNeuron.classList.add('current');
        }
    }
    
    /**
     * Add a synapse to the minimap
     */
    addSynapseToMinimap(fromId, toId) {
        if (!this.minimap) return;
        
        const synapseId = `${fromId}_${toId}`;
        
        const fromNeuron = this.neurons[fromId];
        const toNeuron = this.neurons[toId];
        
        if (!fromNeuron || !toNeuron) return;
        
        // Get positions
        const fromLeft = parseFloat(fromNeuron.style.left);
        const fromTop = parseFloat(fromNeuron.style.top);
        const toLeft = parseFloat(toNeuron.style.left);
        const toTop = parseFloat(toNeuron.style.top);
        
        // Calculate line properties
        const dx = toLeft - fromLeft;
        const dy = toTop - fromTop;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        // Create synapse line element
        const minimapSynapse = document.createElement('div');
        minimapSynapse.className = 'minimap-synapse';
        
        // Position and rotate
        minimapSynapse.style.width = `${length}%`;
        minimapSynapse.style.left = `${fromLeft}%`;
        minimapSynapse.style.top = `${fromTop}%`;
        minimapSynapse.style.transform = `rotate(${angle}deg)`;
        
        // Add to minimap
        this.minimap.insertBefore(minimapSynapse, this.minimap.firstChild);
        this.minimapSynapses[synapseId] = minimapSynapse;
    }
    
    /**
     * Update a minimap neuron position
     */
    updateMinimapNeuron(neuronId) {
        if (!this.minimap) return;
        
        const neuron = this.neurons[neuronId];
        const minimapNeuron = this.minimapNeurons[neuronId];
        
        if (!neuron || !minimapNeuron) return;
        
        // Update position
        const left = parseFloat(neuron.style.left);
        const top = parseFloat(neuron.style.top);
        
        minimapNeuron.style.left = `${left}%`;
        minimapNeuron.style.top = `${top}%`;
        
        // Update state
        minimapNeuron.classList.toggle('active', neuron.classList.contains('active'));
        minimapNeuron.classList.toggle('current', neuron.classList.contains('current'));
        
        // Update connected synapses in minimap
        this.updateMinimapConnectedSynapses(neuronId);
    }
    
    /**
     * Update minimap synapses connected to a neuron
     */
    updateMinimapConnectedSynapses(neuronId) {
        if (!this.minimap) return;
        
        for (const synapseId in this.synapses) {
            const [fromId, toId] = synapseId.split('_');
            
            if (fromId === neuronId || toId === neuronId) {
                const minimapSynapse = this.minimapSynapses[synapseId];
                
                if (!minimapSynapse) {
                    // Create it if it doesn't exist
                    this.addSynapseToMinimap(fromId, toId);
                } else {
                    // Update existing synapse line
                    const fromNeuron = this.neurons[fromId];
                    const toNeuron = this.neurons[toId];
                    
                    if (!fromNeuron || !toNeuron) continue;
                    
                    // Get positions
                    const fromLeft = parseFloat(fromNeuron.style.left);
                    const fromTop = parseFloat(fromNeuron.style.top);
                    const toLeft = parseFloat(toNeuron.style.left);
                    const toTop = parseFloat(toNeuron.style.top);
                    
                    // Calculate line properties
                    const dx = toLeft - fromLeft;
                    const dy = toTop - fromTop;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    
                    // Update synapse line
                    minimapSynapse.style.width = `${length}%`;
                    minimapSynapse.style.left = `${fromLeft}%`;
                    minimapSynapse.style.top = `${fromTop}%`;
                    minimapSynapse.style.transform = `rotate(${angle}deg)`;
                }
            }
        }
    }
    
    /**
     * Create a new tab with a blank page
     */
    createNewTab() {
        const tabId = `tab-${++this.lastTabId}`;
        
        // Create a new tab
        const tab = this.createTabElement(tabId, 'New Tab');
        this.tabBar.appendChild(tab);
        
        // Create a blank page for the tab content
        const page = this.createPageElement(tabId, 'New Tab', '<div class="welcome-page">This is a new tab</div>');
        this.contentDisplay.appendChild(page);
        
        // Store tab data
        this.tabs[tabId] = {
            id: tabId,
            title: 'New Tab',
            url: '',
            pageId: '',
            neuronId: null // Will be set when navigating to a page
        };
        
        // Activate this tab
        this.activateTab(tabId);
        
        // Default to home page
        this.navigateTo('home', tabId);
        
        return tabId;
    }
    
    /**
     * Create a neuron for a specific page
     */
    createNeuron(pageId, title, position = null) {
        const startTime = performance.now();
        
        // If this page already has a neuron, just return its ID
        if (this.pageNeurons[pageId]) {
            return this.pageNeurons[pageId];
        }
        
        // Generate a unique neuron ID
        const neuronId = `neuron-${++this.lastNeuronId}`;
        
        // Generate a position if not provided
        if (!position) {
            position = this.getClusteredPosition(pageId);
        }
        
        this.log('debug', `Creating neuron ${neuronId} for page ${pageId} at (${position.x}, ${position.y})`);
        
        // Create the neuron element
        const neuron = this.neuronTemplate.content.cloneNode(true).querySelector('.neuron');
        neuron.dataset.id = neuronId;
        neuron.dataset.pageId = pageId;
        
        // Apply configured size
        if (this.config.neuronSize !== 46) { // Default size is 46px
            neuron.style.width = `${this.config.neuronSize}px`;
            neuron.style.height = `${Math.floor(this.config.neuronSize * 1.17)}px`; // Maintain aspect ratio
        }
        
        neuron.style.left = `${position.x}%`;
        neuron.style.top = `${position.y}%`;
        
        if (title) {
            neuron.querySelector('.neuron-label').textContent = title;
        }
        
        // Add click handler to activate the page associated with this neuron
        neuron.addEventListener('click', (e) => {
            // Only activate if we're not dragging
            if (!this.isDraggingNeuron) {
                this.log('info', `Neuron clicked: ${neuronId} (page: ${pageId})`);
                
                const startTime = performance.now();
                this.activatePageNeuron(pageId);
                
                if (this.config.performanceMonitoring) {
                    const latency = performance.now() - startTime;
                    this.recordPerformance('interactionLatency', latency);
                }
            }
        });
        
        // Add neuron drag functionality
        this.makeNeuronDraggable(neuron);
        
        this.neuralNetwork.appendChild(neuron);
        this.neurons[neuronId] = neuron;
        
        // Store mapping from page to neuron
        this.pageNeurons[pageId] = neuronId;
        
        // Add a growing animation if enabled
        if (this.config.neuronGrowAnimation) {
            neuron.style.transform = 'translate(-50%, -50%) scale(0)';
            setTimeout(() => {
                neuron.style.transition = `transform ${this.config.neuronGrowDuration / 1000}s cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
                neuron.style.transform = 'translate(-50%, -50%) scale(1)';
                // Clean up transition after animation
                setTimeout(() => {
                    neuron.style.transition = '';
                }, this.config.neuronGrowDuration);
            }, 10);
        }
        
        // Add to minimap
        this.addNeuronToMinimap(neuronId);
        
        if (this.config.performanceMonitoring) {
            const renderTime = performance.now() - startTime;
            this.recordPerformance('renderTime', renderTime);
        }
        
        return neuronId;
    }
    
    /**
     * Get a position that clusters related pages together
     */
    getClusteredPosition(pageId) {
        // Default position if no related pages are found
        let position = {
            x: this.getRandomPosition(30, 70),
            y: this.getRandomPosition(30, 70)
        };
        
        // Check if this page is related to any existing pages
        const relatedPageIds = this.findRelatedPages(pageId);
        
        if (relatedPageIds.length > 0) {
            // Find average position of related neurons
            let totalX = 0;
            let totalY = 0;
            let count = 0;
            
            for (const relatedPageId of relatedPageIds) {
                const relatedNeuronId = this.pageNeurons[relatedPageId];
                if (relatedNeuronId && this.neurons[relatedNeuronId]) {
                    const neuron = this.neurons[relatedNeuronId];
                    totalX += parseFloat(neuron.style.left);
                    totalY += parseFloat(neuron.style.top);
                    count++;
                }
            }
            
            if (count > 0) {
                // Position near the average of related neurons with some randomness
                const avgX = totalX / count;
                const avgY = totalY / count;
                
                // Add some random offset to avoid exact overlapping
                position = {
                    x: avgX + this.getRandomPosition(-10, 10),
                    y: avgY + this.getRandomPosition(-10, 10)
                };
                
                // Ensure we're still within bounds
                position.x = Math.max(10, Math.min(90, position.x));
                position.y = Math.max(10, Math.min(90, position.y));
                
                console.log(`Clustered position for ${pageId} near related pages:`, position);
            }
        }
        
        return position;
    }
    
    /**
     * Find pages that are related to the given page
     */
    findRelatedPages(pageId) {
        const relatedPages = [];
        
        // Simple relationship detection based on matching parts of the pageId
        // This is just a basic example - real implementation would use more sophisticated methods
        for (const existingPageId in this.pageNeurons) {
            // Skip if it's the same page
            if (existingPageId === pageId) continue;
            
            // Check for common words/parts in the pageId
            if (this.pagesAreRelated(pageId, existingPageId)) {
                relatedPages.push(existingPageId);
            }
        }
        
        return relatedPages;
    }
    
    /**
     * Determine if two pages are related
     */
    pagesAreRelated(pageId1, pageId2) {
        // Get the page data from mock pages
        const page1 = mockPages[pageId1];
        const page2 = mockPages[pageId2];
        
        if (!page1 || !page2) return false;
        
        // Relationship types:
        
        // 1. Pages with similar titles
        const title1 = page1.title.toLowerCase();
        const title2 = page2.title.toLowerCase();
        
        const titleWords1 = title1.split(/\s+/).filter(w => w.length > 3);
        const titleWords2 = title2.split(/\s+/).filter(w => w.length > 3);
        
        for (const word of titleWords1) {
            if (titleWords2.includes(word)) return true;
        }
        
        // 2. Pages with links to each other
        const content1 = page1.content;
        const content2 = page2.content;
        
        if (content1.includes(`data-page-id="${pageId2}"`) || 
            content2.includes(`data-page-id="${pageId1}"`)) {
            return true;
        }
        
        // No relation found
        return false;
    }
    
    /**
     * Make a neuron draggable
     */
    makeNeuronDraggable(neuron) {
        // State for dragging
        let isDragging = false;
        let startPos = { x: 0, y: 0 };
        
        // Mouse down on neuron starts potential drag
        neuron.addEventListener('mousedown', (e) => {
            // Prevent default behavior and bubbling
            e.preventDefault();
            e.stopPropagation();
            
            // Ignore right-click (handled by contextmenu event)
            if (e.button === 2) return;
            
            // Store starting position
            startPos = {
                x: e.clientX,
                y: e.clientY
            };
            
            // Set the dragging flag
            isDragging = true;
            this.isDraggingNeuron = true;
            
            // Add a dragging class
            neuron.classList.add('dragging');
        });
        
        // Add context menu for neuron actions like delete
        neuron.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            // Create context menu
            this.showNeuronContextMenu(neuron, e.clientX, e.clientY);
        });
        
        // Mouse move to handle dragging
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            // Calculate the change in position
            const deltaX = e.clientX - startPos.x;
            const deltaY = e.clientY - startPos.y;
            
            // Get the current position as percentage
            const currentLeft = parseFloat(neuron.style.left);
            const currentTop = parseFloat(neuron.style.top);
            
            // Calculate new position while applying scaling factor
            // (1/scale to compensate for the brain's scale)
            const newLeft = currentLeft + (deltaX / this.neuralNetwork.offsetWidth) * 100 / this.brainScale;
            const newTop = currentTop + (deltaY / this.neuralNetwork.offsetHeight) * 100 / this.brainScale;
            
            // Update the neuron position
            neuron.style.left = `${newLeft}%`;
            neuron.style.top = `${newTop}%`;
            
            // Update starting position for next move
            startPos = {
                x: e.clientX,
                y: e.clientY
            };
            
            // Update any connected synapses
            this.updateConnectedSynapses(neuron.dataset.id);
            
            // Update minimap
            this.updateMinimapNeuron(neuron.dataset.id);
        });
        
        // Mouse up to end dragging
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.isDraggingNeuron = false;
                neuron.classList.remove('dragging');
            }
        });
    }
    
    /**
     * Show context menu for a neuron
     */
    showNeuronContextMenu(neuron, x, y) {
        // Remove any existing context menu
        const existingMenu = document.getElementById('neuron-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        const neuronId = neuron.dataset.id;
        const pageId = neuron.dataset.pageId;
        
        // Create context menu
        const menu = document.createElement('div');
        menu.id = 'neuron-context-menu';
        menu.className = 'context-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        
        // Add menu items
        menu.innerHTML = `
            <div class="context-menu-item" data-action="open-tab">Open in New Tab</div>
            <div class="context-menu-item" data-action="focus">Focus on this Neuron</div>
            <div class="context-menu-item" data-action="connect">Connect to Current</div>
            <div class="context-menu-item danger" data-action="remove">Remove Neuron</div>
        `;
        
        // Add click handlers
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                
                if (action === 'open-tab') {
                    const newTabId = this.createNewTab();
                    this.navigateTo(pageId, newTabId);
                }
                else if (action === 'focus') {
                    // Animate brain to center on this neuron
                    const left = parseFloat(neuron.style.left);
                    const top = parseFloat(neuron.style.top);
                    
                    // Calculate position in pixels
                    const brainWidth = this.neuralNetwork.offsetWidth;
                    const brainHeight = this.neuralNetwork.offsetHeight;
                    
                    const targetX = -(left / 100 * brainWidth - brainWidth / 2);
                    const targetY = -(top / 100 * brainHeight - brainHeight / 2);
                    
                    this.animateBrainPosition(targetX, targetY);
                }
                else if (action === 'connect') {
                    // Create synapse from current active neuron to this one
                    const currentPageId = this.activeTabId ? this.tabs[this.activeTabId].pageId : null;
                    if (currentPageId && currentPageId !== pageId) {
                        const currentNeuronId = this.pageNeurons[currentPageId];
                        if (currentNeuronId) {
                            this.createSynapse(currentNeuronId, neuronId);
                        }
                    }
                }
                else if (action === 'remove') {
                    this.removeNeuron(neuronId);
                }
                
                // Remove the menu
                menu.remove();
            });
        });
        
        // Add the menu to the document
        document.body.appendChild(menu);
        
        // Handle clicking outside the menu to close it
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        // Slight delay to avoid the current click event
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 10);
    }
    
    /**
     * Remove a neuron from the brain
     */
    removeNeuron(neuronId) {
        const neuron = this.neurons[neuronId];
        if (!neuron) return;
        
        const pageId = neuron.dataset.pageId;
        
        this.log('info', `Removing neuron ${neuronId} for page ${pageId}`);
        
        // Check if this neuron is associated with any open tabs
        // If so, close those tabs
        const tabsToClose = [];
        for (const tabId in this.tabs) {
            if (this.tabs[tabId].neuronId === neuronId) {
                tabsToClose.push(tabId);
            }
        }
        
        // Close any tabs associated with this neuron
        for (const tabId of tabsToClose) {
            this.closeTab(tabId);
        }
        
        // First, remove any synapse connected to this neuron
        const synapsesToRemove = [];
        
        for (const synapseId in this.synapses) {
            const [fromId, toId] = synapseId.split('_');
            if (fromId === neuronId || toId === neuronId) {
                synapsesToRemove.push(synapseId);
            }
        }
        
        // Remove synapses
        synapsesToRemove.forEach(synapseId => {
            const synapse = this.synapses[synapseId];
            if (synapse) {
                synapse.remove();
                delete this.synapses[synapseId];
                
                // Also remove from minimap
                const minimapSynapse = this.minimapSynapses[synapseId];
                if (minimapSynapse) {
                    minimapSynapse.remove();
                    delete this.minimapSynapses[synapseId];
                }
            }
        });
        
        // Remove from minimap
        const minimapNeuron = this.minimapNeurons[neuronId];
        if (minimapNeuron) {
            minimapNeuron.remove();
            delete this.minimapNeurons[neuronId];
        }
        
        // Remove the mapping from page to neuron
        if (this.pageNeurons[pageId] === neuronId) {
            delete this.pageNeurons[pageId];
        }
        
        // Remove the neuron element
        neuron.remove();
        delete this.neurons[neuronId];
        
        // Save state to local storage
        this.saveToLocalStorage();
    }
    
    /**
     * Update synapses connected to a neuron that has moved
     */
    updateConnectedSynapses(neuronId) {
        for (const synapseId in this.synapses) {
            const [fromId, toId] = synapseId.split('_');
            
            if (fromId === neuronId || toId === neuronId) {
                // Get the neurons for this synapse
                const fromNeuron = this.neurons[fromId];
                const toNeuron = this.neurons[toId];
                
                if (!fromNeuron || !toNeuron) continue;
                
                // Get their positions
                const fromPos = {
                    x: parseFloat(fromNeuron.style.left),
                    y: parseFloat(fromNeuron.style.top)
                };
                
                const toPos = {
                    x: parseFloat(toNeuron.style.left),
                    y: parseFloat(toNeuron.style.top)
                };
                
                // Update the path
                const synapse = this.synapses[synapseId];
                const path = synapse.querySelector('.synapse-path');
                const pulse = synapse.querySelector('.pulse');
                
                // Update the path definition
                const d = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x + (toPos.x - fromPos.x) * 0.5} ${fromPos.y}, ${fromPos.x + (toPos.x - fromPos.x) * 0.5} ${toPos.y}, ${toPos.x} ${toPos.y}`;
                path.setAttribute('d', d);
                
                // Update the pulse path
                try {
                    pulse.style.offsetPath = `path("${d}")`;
                } catch (e) {
                    console.error("Error updating offsetPath:", e);
                }
            }
        }
        
        // Save the updated positions to local storage
        this.saveToLocalStorage();
    }
    
    /**
     * Create a synapse between two neurons
     */
    createSynapse(fromId, toId) {
        const startTime = performance.now();
        
        const synapseId = `${fromId}_${toId}`;
        this.log('debug', `Creating synapse: ${synapseId}`);
        
        // Check if this synapse already exists
        if (this.synapses[synapseId]) {
            this.log('debug', `Synapse ${synapseId} already exists, just updating animation`);
            // Just update the animation to show activity
            const pulse = this.synapses[synapseId].querySelector('.pulse');
            pulse.style.animation = 'none';
            setTimeout(() => {
                pulse.style.animation = `pulseThroughSynapse ${this.config.pulseAnimationDuration}s linear`;
            }, 10);
            return;
        }
        
        // Get positions of neurons
        const fromNeuron = this.neurons[fromId];
        const toNeuron = this.neurons[toId];
        
        if (!fromNeuron || !toNeuron) {
            this.log('error', `Cannot create synapse: missing neurons. fromId=${fromId}, toId=${toId}`);
            return;
        }
        
        const fromPos = {
            x: parseFloat(fromNeuron.style.left),
            y: parseFloat(fromNeuron.style.top)
        };
        
        const toPos = {
            x: parseFloat(toNeuron.style.left),
            y: parseFloat(toNeuron.style.top)
        };
        
        // Create synapse SVG
        const synapse = this.synapseTemplate.content.cloneNode(true).querySelector('.synapse');
        synapse.dataset.from = fromId;
        synapse.dataset.to = toId;
        
        // Set path
        const path = synapse.querySelector('.synapse-path');
        
        // Apply configured style
        path.style.strokeWidth = this.config.synapseWidth;
        path.style.strokeOpacity = this.config.synapseOpacity;
        
        // Create a curved path between neurons
        // Note: We're using percentage values for positions
        const d = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x + (toPos.x - fromPos.x) * 0.5} ${fromPos.y}, ${fromPos.x + (toPos.x - fromPos.x) * 0.5} ${toPos.y}, ${toPos.x} ${toPos.y}`;
        path.setAttribute('d', d);
        
        // Setup pulse animation
        const pulse = synapse.querySelector('.pulse');
        
        // Use offset-path for the pulse animation
        // Ensure it works across browsers by using the standard property
        try {
            pulse.style.offsetPath = `path("${d}")`;
        } catch (e) {
            this.log('error', "Error setting offsetPath:", e);
        }
        
        // Try alternative browser-specific properties if needed
        try {
            pulse.style.motionPath = `path("${d}")`;
        } catch (e) {
            // Silently fail, this is just a fallback
        }
        
        // Apply animation duration from config
        path.style.animation = `synapseFlow ${this.config.synapseAnimationDuration}s linear infinite`;
        pulse.style.animation = `pulseThroughSynapse ${this.config.pulseAnimationDuration}s linear`;
        
        // Add a unique ID to help with debugging
        synapse.id = `synapse-${synapseId}`;
        
        // Insert at beginning so it's behind neurons
        this.neuralNetwork.insertBefore(synapse, this.neuralNetwork.firstChild);
        this.synapses[synapseId] = synapse;
        
        // Add to minimap
        this.addSynapseToMinimap(fromId, toId);
        
        if (this.config.performanceMonitoring) {
            const renderTime = performance.now() - startTime;
            this.recordPerformance('renderTime', renderTime);
        }
        
        return synapse;
    }
    
    /**
     * Create a new tab element
     */
    createTabElement(id, title) {
        const tab = this.tabTemplate.content.cloneNode(true).querySelector('.tab');
        tab.dataset.id = id;
        tab.querySelector('.tab-title').textContent = title;
        
        // Add close handler
        tab.querySelector('.close-tab-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(id);
        });
        
        // Add click handler to activate tab
        tab.addEventListener('click', () => this.activateTab(id));
        
        return tab;
    }
    
    /**
     * Create a new page element
     */
    createPageElement(id, title, content) {
        const page = this.pageTemplate.content.cloneNode(true).querySelector('.page');
        page.dataset.id = id;
        page.querySelector('.page-title').textContent = title;
        page.querySelector('.page-body').innerHTML = content;
        
        // Make sure the iframe container is hidden by default (mock content is shown)
        const iframeContainer = page.querySelector('.iframe-container');
        if (iframeContainer) {
            iframeContainer.style.display = 'none';
        }
        
        this.pages[id] = page;
        return page;
    }
    
    /**
     * Activate a tab
     */
    activateTab(tabId) {
        if (!tabId || !this.tabs[tabId]) return;
        
        // Get the pageId associated with this tab
        const pageId = this.tabs[tabId].pageId;
        
        // Update active tab marker
        this.activeTabId = tabId;
        
        // Update URL input
        if (pageId) {
            this.urlInput.value = mockPageUrls[pageId];
        }
        
        // Update tab UI elements
        for (const id in this.tabs) {
            const tab = this.tabBar.querySelector(`.tab[data-id="${id}"]`);
            if (tab) {
                tab.classList.toggle('active', id === tabId);
            }
        }
        
        // Show active page
        for (const id in this.pages) {
            if (this.pages[id]) {
                this.pages[id].classList.toggle('active', id === tabId);
            }
        }
        
        // Update neuron states - first clear all states
        for (const neuronId in this.neurons) {
            const neuron = this.neurons[neuronId];
            neuron.classList.remove('active', 'current');
        }
        
        // Mark neurons for open tabs as "active"
        for (const id in this.tabs) {
            const neuronId = this.tabs[id].neuronId;
            if (neuronId && this.neurons[neuronId]) {
                this.neurons[neuronId].classList.add('active');
            }
        }
        
        // Mark the current page's neuron as "current"
        if (pageId) {
            const neuronId = this.pageNeurons[pageId];
            if (neuronId && this.neurons[neuronId]) {
                this.neurons[neuronId].classList.add('current');
            }
        }
        
        // Update minimap to match
        for (const neuronId in this.minimapNeurons) {
            const minimapNeuron = this.minimapNeurons[neuronId];
            minimapNeuron.classList.remove('active', 'current');
            
            // If this neuron is active in the main view, mark it active in minimap
            if (this.neurons[neuronId] && this.neurons[neuronId].classList.contains('active')) {
                minimapNeuron.classList.add('active');
            }
            
            // If this neuron is the current one, mark it in minimap
            if (this.neurons[neuronId] && this.neurons[neuronId].classList.contains('current')) {
                minimapNeuron.classList.add('current');
            }
        }
        
        // Save state to local storage
        this.saveToLocalStorage();
        
        console.log(`Activated tab: ${tabId} (page: ${pageId})`);
    }
    
    /**
     * Activate a neuron and its associated page
     */
    activatePageNeuron(pageId) {
        console.log(`Activating neuron for page: ${pageId}`);
        
        // Find a tab that is currently showing this page
        let tabId = null;
        for (const id in this.tabs) {
            if (this.tabs[id].pageId === pageId) {
                tabId = id;
                break;
            }
        }
        
        // NOTE: Removing automatic synapse creation on direct neuron click
        // The synapses should only be created when navigating via links
        
        // If no tab is showing this page, use the active tab to navigate to it
        if (!tabId && this.activeTabId) {
            this.navigateTo(pageId, this.activeTabId, null, false); // Don't create synapse on direct navigation
            return;
        } else if (!tabId) {
            // If no active tab, create a new one for this page
            tabId = this.createNewTab();
            this.navigateTo(pageId, tabId, null, false); // Don't create synapse on direct navigation
            return;
        }
        
        // Activate the tab that shows this page
        this.activateTab(tabId);
    }
    
    /**
     * Navigate to a specific mock page
     */
    navigateTo(pageId, tabId = null, sourceNeuronId = null, createSynapse = true) {
        // If no tab ID is provided, use the active tab
        const targetTabId = tabId || this.activeTabId;
        
        if (!targetTabId || !mockPages[pageId]) return;
        
        // Get the current page ID of the tab
        const oldPageId = this.tabs[targetTabId].pageId;
        const oldNeuronId = this.tabs[targetTabId].neuronId;
        
        // Check if we already have a neuron for this page
        let neuronId = this.pageNeurons[pageId];
        let isExistingNeuron = !!neuronId;
        
        // If not, create a new neuron for this page
        if (!neuronId) {
            neuronId = this.createNeuron(pageId, mockPages[pageId].title);
        }
        
        // Update tab data
        this.tabs[targetTabId].title = mockPages[pageId].title;
        this.tabs[targetTabId].url = mockPageUrls[pageId];
        this.tabs[targetTabId].pageId = pageId;
        this.tabs[targetTabId].neuronId = neuronId;
        this.tabs[targetTabId].isWebUrl = false;
        
        // Update tab title
        const tab = this.tabBar.querySelector(`.tab[data-id="${targetTabId}"]`);
        if (tab) tab.querySelector('.tab-title').textContent = mockPages[pageId].title;
        
        // Update page content
        let page = this.pages[targetTabId];
        if (page) {
            // Set the title and content for mock page
            page.querySelector('.page-title').textContent = mockPages[pageId].title;
            page.querySelector('.page-body').innerHTML = mockPages[pageId].content;
            
            // Show mock content and hide iframe
            const pageBody = page.querySelector('.page-body');
            const iframeContainer = page.querySelector('.iframe-container');
            
            pageBody.style.display = 'block';
            iframeContainer.style.display = 'none';
            
            // Reset iframe to blank to reduce resource usage
            const iframe = iframeContainer.querySelector('.web-iframe');
            iframe.src = 'about:blank';
        }
        
        // Update URL input
        this.urlInput.value = mockPageUrls[pageId];
        
        // Create synapse based on source
        if (sourceNeuronId && sourceNeuronId !== neuronId && createSynapse) {
            // If a source neuron was provided (for opening in new tab), use it
            this.createSynapse(sourceNeuronId, neuronId);
        } else if (oldPageId && oldPageId !== pageId && oldNeuronId && createSynapse) {
            // Otherwise use the old neuron from this tab (regular navigation)
            this.createSynapse(oldNeuronId, neuronId);
        }
        
        // Update active tab and neuron states
        this.activateTab(targetTabId);
        
        // Save state to local storage
        this.saveToLocalStorage();
    }
    
    /**
     * Navigate by URL input
     */
    navigateToUrl() {
        const url = this.urlInput.value.trim();
        
        // First check if it's a mock page
        let pageId = null;
        for (const [id, mockUrl] of Object.entries(mockPageUrls)) {
            if (url === mockUrl || url.includes(id)) {
                pageId = id;
                break;
            }
        }
        
        // Navigate to mock page if found
        if (pageId) {
            this.navigateTo(pageId);
        } 
        // Navigate to real URL if it looks like a URL
        else if (this.isValidUrl(url)) {
            this.navigateToRealUrl(url);
        }
        // Navigate to home as fallback
        else if (this.activeTabId) {
            this.navigateTo('home');
        }
    }
    
    /**
     * Check if a string appears to be a valid URL
     */
    isValidUrl(string) {
        try {
            // Add https:// if no protocol is specified
            if (!string.startsWith('http://') && !string.startsWith('https://')) {
                string = 'https://' + string;
            }
            
            // Check if it can be parsed as a URL
            new URL(string);
            return true;
        } catch (err) {
            return false;
        }
    }
    
    /**
     * Navigate to a real URL using an iframe
     */
    navigateToRealUrl(url) {
        // If no active tab, create one
        if (!this.activeTabId) {
            this.createNewTab();
        }
        
        // Ensure the URL has a protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        // Extract domain for title and neuron label
        let domain = '';
        try {
            domain = new URL(url).hostname;
        } catch (e) {
            domain = url;
        }
        
        // Create or reuse a neuron for this domain
        let neuronId = this.findOrCreateNeuronForDomain(domain, url);
        
        // Get the current page ID and neuron ID
        const tabId = this.activeTabId;
        const oldPageId = this.tabs[tabId].pageId;
        const oldNeuronId = this.tabs[tabId].neuronId;
        
        // Update tab data with real URL info
        this.tabs[tabId].title = domain;
        this.tabs[tabId].url = url;
        this.tabs[tabId].pageId = 'web:' + domain; // Create a synthetic pageId
        this.tabs[tabId].neuronId = neuronId;
        this.tabs[tabId].isWebUrl = true;
        
        // Update tab title
        const tab = this.tabBar.querySelector(`.tab[data-id="${tabId}"]`);
        if (tab) tab.querySelector('.tab-title').textContent = domain;
        
        // Update page content - hide mock content, show iframe
        let page = this.pages[tabId];
        if (page) {
            // Set the title
            page.querySelector('.page-title').textContent = domain;
            
            // Hide the mock content body and show the iframe
            const pageBody = page.querySelector('.page-body');
            const iframeContainer = page.querySelector('.iframe-container');
            
            pageBody.style.display = 'none';
            iframeContainer.style.display = 'flex';
            
            // Set iframe src to the URL
            const iframe = iframeContainer.querySelector('.web-iframe');
            
            // Clear any existing error message
            const existingError = iframeContainer.querySelector('.iframe-error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Check if this is a known site that blocks iframe embedding
            const isKnownBlockedSite = this.knownXFrameBlockedSites.some(blockedDomain => 
                domain.includes(blockedDomain) || domain.endsWith('.' + blockedDomain)
            );
            
            if (isKnownBlockedSite) {
                // Immediately show error message without trying to load
                this.log('info', `Skipping iframe load for known X-Frame-Options site: ${domain}`);
                this.handleIframeError(iframeContainer, domain, url);
            } else {
                // Add iframe load error handling
                iframe.onerror = () => this.handleIframeError(iframeContainer, domain, url);
                iframe.onload = () => {
                    // Check if we can access the iframe content
                    try {
                        // This will throw an error if the iframe can't be accessed due to X-Frame-Options
                        iframe.contentWindow.location.href;
                    } catch (e) {
                        this.handleIframeError(iframeContainer, domain, url);
                    }
                };
                
                // Set the iframe src
                iframe.src = url;
            }
        }
        
        // Update URL input
        this.urlInput.value = url;
        
        // Create synapse if navigating from another page
        if (oldPageId && oldPageId !== 'web:' + domain && oldNeuronId) {
            this.createSynapse(oldNeuronId, neuronId);
        }
        
        // Update active tab and neuron states
        this.activateTab(tabId);
        
        // Save state to local storage
        this.saveToLocalStorage();
    }
    
    /**
     * Handle iframe loading errors, particularly X-Frame-Options restrictions
     */
    handleIframeError(container, domain, url) {
        const iframe = container.querySelector('.web-iframe');
        
        // Hide the iframe
        iframe.style.display = 'none';
        
        // Remove existing error message if any
        const existingError = container.querySelector('.iframe-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'iframe-error-message';
        errorMessage.innerHTML = `
            <div class="error-icon">⚠️</div>
            <h3>Cannot Display ${domain}</h3>
            <p>This website cannot be displayed in an iframe due to security restrictions set by the site (X-Frame-Options).</p>
            <p>This is a common security measure used by sites like Google, Facebook, and many others to prevent clickjacking attacks.</p>
            <div class="error-actions">
                <a href="${url}" target="_blank" class="open-button">Open in New Tab</a>
            </div>
        `;
        
        // Add error message to container
        container.appendChild(errorMessage);
    }
    
    /**
     * Find or create a neuron for a web domain
     */
    findOrCreateNeuronForDomain(domain, url) {
        const webPageId = 'web:' + domain;
        
        // Check if we already have a neuron for this domain
        if (this.pageNeurons[webPageId]) {
            return this.pageNeurons[webPageId];
        }
        
        // Create a new neuron for this domain
        return this.createNeuron(webPageId, domain);
    }
    
    /**
     * Close a tab (but keep its neurons in the network)
     */
    closeTab(id) {
        // Remove tab element
        const tab = this.tabBar.querySelector(`.tab[data-id="${id}"]`);
        if (tab) tab.remove();
        
        // Remove page element
        const page = this.pages[id];
        if (page) page.remove();
        
        // Get the neuron for this tab
        const tabData = this.tabs[id];
        if (tabData && tabData.neuronId) {
            const neuron = this.neurons[tabData.neuronId];
            if (neuron) {
                // Remove active and current classes
                neuron.classList.remove('active', 'current');
                
                // Also update in minimap
                const minimapNeuron = this.minimapNeurons[tabData.neuronId];
                if (minimapNeuron) {
                    minimapNeuron.classList.remove('active', 'current');
                }
                
                // Log that we're keeping the neuron
                this.log('debug', `Closed tab ${id} but keeping neuron ${tabData.neuronId}`);
            }
        }
        
        // Clear from tabs list
        delete this.tabs[id];
        delete this.pages[id];
        
        // If this was the active tab, activate another tab if available
        if (id === this.activeTabId) {
            const tabIds = Object.keys(this.tabs);
            if (tabIds.length > 0) {
                this.activateTab(tabIds[0]);
            } else {
                this.activeTabId = null;
                this.urlInput.value = '';
            }
        }
        
        // Save state to local storage to ensure consistency
        this.saveToLocalStorage();
    }
    
    /**
     * Zoom the brain visualization
     */
    zoomBrain(delta) {
        const newScale = Math.max(0.5, Math.min(3, this.brainScale + delta));
        this.brainScale = newScale;
        this.updateBrainTransform();
    }
    
    /**
     * Reset the brain view to default
     */
    resetBrainView() {
        this.brainScale = 1;
        this.brainPosition = { x: 0, y: 0 };
        this.updateBrainTransform();
    }
    
    /**
     * Start brain dragging
     */
    startDragging(e) {
        this.isDragging = true;
        this.dragStartPosition = {
            x: e.clientX - this.brainPosition.x,
            y: e.clientY - this.brainPosition.y
        };
    }
    
    /**
     * Drag the brain view
     */
    dragBrain(e) {
        if (!this.isDragging) return;
        
        this.brainPosition = {
            x: e.clientX - this.dragStartPosition.x,
            y: e.clientY - this.dragStartPosition.y
        };
        
        this.updateBrainTransform();
    }
    
    /**
     * Stop brain dragging
     */
    stopDragging() {
        this.isDragging = false;
    }
    
    /**
     * Update the brain transformation (scale and position)
     */
    updateBrainTransform() {
        this.neuralNetwork.style.transform = `translate(${this.brainPosition.x}px, ${this.brainPosition.y}px) scale(${this.brainScale})`;
        
        // Update minimap viewport
        this.updateMinimapViewport();
    }
    
    /**
     * Get a random position within the specified range
     */
    getRandomPosition(min, max) {
        return min + Math.random() * (max - min);
    }
    
    /**
     * Toggle debug view to highlight synapses and help with troubleshooting
     */
    toggleDebugView() {
        this.log('info', 'Toggled debug view');
        
        // Toggle a debug class on the neural network
        this.neuralNetwork.classList.toggle('debug-mode');
        
        // Check if debug panel already exists
        let debugPanel = document.getElementById('debug-panel');
        
        if (debugPanel) {
            // If it exists, just toggle visibility
            debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
        } else {
            // Create debug panel
            debugPanel = document.createElement('div');
            debugPanel.id = 'debug-panel';
            debugPanel.className = 'debug-panel';
            
            // Add configuration section
            const configSection = document.createElement('div');
            configSection.innerHTML = `
                <h3>Configuration</h3>
                <div class="config-controls">
                    <label>
                        Log Level: 
                        <select id="config-log-level">
                            <option value="debug" ${this.config.logLevel === 'debug' ? 'selected' : ''}>Debug</option>
                            <option value="info" ${this.config.logLevel === 'info' ? 'selected' : ''}>Info</option>
                            <option value="warn" ${this.config.logLevel === 'warn' ? 'selected' : ''}>Warn</option>
                            <option value="error" ${this.config.logLevel === 'error' ? 'selected' : ''}>Error</option>
                            <option value="none" ${this.config.logLevel === 'none' ? 'selected' : ''}>None</option>
                        </select>
                    </label>
                    <label>
                        Track Interactions: 
                        <input type="checkbox" id="config-track-interactions" ${this.config.trackUserInteractions ? 'checked' : ''}>
                    </label>
                    <label>
                        Performance Monitoring: 
                        <input type="checkbox" id="config-performance-monitoring" ${this.config.performanceMonitoring ? 'checked' : ''}>
                    </label>
                    <label>
                        Neuron Size: 
                        <input type="range" id="config-neuron-size" min="20" max="80" value="${this.config.neuronSize}">
                        <span>${this.config.neuronSize}px</span>
                    </label>
                    <label>
                        Synapse Width: 
                        <input type="range" id="config-synapse-width" min="1" max="10" value="${this.config.synapseWidth}">
                        <span>${this.config.synapseWidth}px</span>
                    </label>
                    <label>
                        Neuron Animation: 
                        <input type="checkbox" id="config-neuron-animation" ${this.config.neuronGrowAnimation ? 'checked' : ''}>
                    </label>
                    <button id="config-apply">Apply Changes</button>
                </div>
            `;
            
            // Add performance section
            const performanceSection = document.createElement('div');
            performanceSection.innerHTML = `
                <h3>Performance Metrics</h3>
                <div id="performance-data">Loading performance data...</div>
            `;
            
            // Add state section
            const stateSection = document.createElement('div');
            stateSection.innerHTML = `
                <h3>Brain State</h3>
                <div>
                    <p>Neurons: ${Object.keys(this.neurons).length}</p>
                    <p>Synapses: ${Object.keys(this.synapses).length}</p>
                    <p>Pages with neurons: ${Object.keys(this.pageNeurons).length}</p>
                </div>
            `;
            
            // Add log section
            const logSection = document.createElement('div');
            logSection.innerHTML = `
                <h3>Recent Interactions</h3>
                <div id="interaction-log">
                    ${this.config.trackUserInteractions ? 
                      this.interactionLog.slice(-10).map(log => 
                        `<div class="log-entry ${log.level}">
                           <span class="timestamp">${new Date(log.timestamp).toLocaleTimeString()}</span>
                           <span class="message">${log.message}</span>
                         </div>`
                      ).join('') : 
                      'Interaction tracking is disabled'}
                </div>
            `;
            
            // Assemble panel
            debugPanel.appendChild(configSection);
            debugPanel.appendChild(performanceSection);
            debugPanel.appendChild(stateSection);
            debugPanel.appendChild(logSection);
            
            // Add to page
            document.body.appendChild(debugPanel);
            
            // Add event listeners for configuration controls
            document.getElementById('config-log-level').addEventListener('change', (e) => {
                this.config.logLevel = e.target.value;
            });
            
            document.getElementById('config-track-interactions').addEventListener('change', (e) => {
                this.config.trackUserInteractions = e.target.checked;
            });
            
            document.getElementById('config-performance-monitoring').addEventListener('change', (e) => {
                this.config.performanceMonitoring = e.target.checked;
                if (e.target.checked && this.performanceMetrics.frameRates.length === 0) {
                    this.initPerformanceMonitoring();
                }
            });
            
            document.getElementById('config-neuron-size').addEventListener('input', (e) => {
                const sizeValue = parseInt(e.target.value);
                e.target.nextElementSibling.textContent = `${sizeValue}px`;
                // Don't update config until Apply is clicked
            });
            
            document.getElementById('config-synapse-width').addEventListener('input', (e) => {
                const widthValue = parseInt(e.target.value);
                e.target.nextElementSibling.textContent = `${widthValue}px`;
                // Don't update config until Apply is clicked
            });
            
            document.getElementById('config-neuron-animation').addEventListener('change', (e) => {
                // Don't update config until Apply is clicked
            });
            
            document.getElementById('config-apply').addEventListener('click', () => {
                // Apply neuron size changes
                const newSize = parseInt(document.getElementById('config-neuron-size').value);
                if (newSize !== this.config.neuronSize) {
                    this.config.neuronSize = newSize;
                    // Update existing neurons
                    for (const neuronId in this.neurons) {
                        const neuron = this.neurons[neuronId];
                        neuron.style.width = `${newSize}px`;
                        neuron.style.height = `${Math.floor(newSize * 1.17)}px`;
                    }
                }
                
                // Apply synapse width changes
                const newWidth = parseInt(document.getElementById('config-synapse-width').value);
                if (newWidth !== this.config.synapseWidth) {
                    this.config.synapseWidth = newWidth;
                    // Update existing synapses
                    for (const synapseId in this.synapses) {
                        const synapse = this.synapses[synapseId];
                        const path = synapse.querySelector('.synapse-path');
                        path.style.strokeWidth = newWidth;
                    }
                }
                
                // Apply animation setting
                this.config.neuronGrowAnimation = document.getElementById('config-neuron-animation').checked;
                
                this.log('info', 'Applied configuration changes', this.config);
            });
            
            // Update performance data periodically
            if (this.config.performanceMonitoring) {
                const updatePerformanceData = () => {
                    const perfDataElem = document.getElementById('performance-data');
                    if (perfDataElem) {
                        const avgFps = this.performanceMetrics.frameRates.length > 0 ? 
                            this.performanceMetrics.frameRates.reduce((a, b) => a + b, 0) / this.performanceMetrics.frameRates.length : 0;
                        
                        const avgRenderTime = this.performanceMetrics.renderTimes.length > 0 ?
                            this.performanceMetrics.renderTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.renderTimes.length : 0;
                        
                        const avgLatency = this.performanceMetrics.interactionLatencies.length > 0 ?
                            this.performanceMetrics.interactionLatencies.reduce((a, b) => a + b, 0) / this.performanceMetrics.interactionLatencies.length : 0;
                        
                        perfDataElem.innerHTML = `
                            <p>Average FPS: ${avgFps.toFixed(2)}</p>
                            <p>Average Render Time: ${avgRenderTime.toFixed(2)}ms</p>
                            <p>Average Interaction Latency: ${avgLatency.toFixed(2)}ms</p>
                        `;
                    }
                    
                    // Also update interaction log
                    const logElem = document.getElementById('interaction-log');
                    if (logElem && this.config.trackUserInteractions) {
                        logElem.innerHTML = this.interactionLog.slice(-10).map(log => 
                            `<div class="log-entry ${log.level}">
                               <span class="timestamp">${new Date(log.timestamp).toLocaleTimeString()}</span>
                               <span class="message">${log.message}</span>
                             </div>`
                        ).join('');
                    }
                    
                    // Continue updating if panel is visible
                    if (debugPanel.style.display !== 'none') {
                        setTimeout(updatePerformanceData, 1000);
                    }
                };
                
                updatePerformanceData();
            }
        }
        
        // Display performance data in console if monitoring is enabled
        if (this.config.performanceMonitoring) {
            // Calculate average metrics
            const avgFps = this.performanceMetrics.frameRates.length > 0 ? 
                this.performanceMetrics.frameRates.reduce((a, b) => a + b, 0) / this.performanceMetrics.frameRates.length : 0;
            
            const avgRenderTime = this.performanceMetrics.renderTimes.length > 0 ?
                this.performanceMetrics.renderTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.renderTimes.length : 0;
            
            const avgLatency = this.performanceMetrics.interactionLatencies.length > 0 ?
                this.performanceMetrics.interactionLatencies.reduce((a, b) => a + b, 0) / this.performanceMetrics.interactionLatencies.length : 0;
            
            // Log performance metrics
            console.log('Performance Metrics:');
            console.log(`- Average FPS: ${avgFps.toFixed(2)}`);
            console.log(`- Average Render Time: ${avgRenderTime.toFixed(2)}ms`);
            console.log(`- Average Interaction Latency: ${avgLatency.toFixed(2)}ms`);
        }
        
        // Show configuration settings
        console.log('Current Configuration:', this.config);
        
        // Log current state
        console.log('Current state:');
        console.log(`- Neurons: ${Object.keys(this.neurons).length}`);
        console.log(`- Synapses: ${Object.keys(this.synapses).length}`);
        console.log(`- Pages with neurons: ${Object.keys(this.pageNeurons).length}`);
        
        // Show recent user interactions if tracking is enabled
        if (this.config.trackUserInteractions) {
            console.log('Recent User Interactions:', this.interactionLog.slice(-10));
        }
        
        // Temporarily highlight all synapses
        for (const synapseId in this.synapses) {
            const synapse = this.synapses[synapseId];
            synapse.classList.toggle('highlight');
            
            // Log synapse details
            const [fromId, toId] = synapseId.split('_');
            this.log('debug', `Synapse: ${fromId} -> ${toId}`);
        }
    }
    
    /**
     * Save the current state to local storage
     */
    saveToLocalStorage() {
        // Create a data object to store
        const saveData = {
            neurons: {},
            synapses: Object.keys(this.synapses),
            pageNeurons: this.pageNeurons,
            lastNeuronId: this.lastNeuronId,
            lastTabId: this.lastTabId,
            // Save configuration
            config: this.config
        };
        
        // Store neuron positions
        for (const neuronId in this.neurons) {
            const neuron = this.neurons[neuronId];
            saveData.neurons[neuronId] = {
                left: parseFloat(neuron.style.left),
                top: parseFloat(neuron.style.top),
                pageId: neuron.dataset.pageId,
                label: neuron.querySelector('.neuron-label').textContent
            };
        }
        
        // Convert to JSON and save
        try {
            localStorage.setItem('brainBrowser', JSON.stringify(saveData));
            console.log('Saved state to local storage');
        } catch (e) {
            console.error('Failed to save to local storage:', e);
        }
    }
    
    /**
     * Load the state from local storage
     */
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('brainBrowser');
            if (!savedData) {
                console.log('No saved data found in local storage');
                return;
            }
            
            const data = JSON.parse(savedData);
            console.log('Loaded data from local storage:', data);
            
            // Restore configuration if available
            if (data.config) {
                this.config = { ...this.config, ...data.config };
                console.log('Restored configuration from local storage');
                
                // Start performance monitoring if it was enabled
                if (this.config.performanceMonitoring && this.performanceMetrics.frameRates.length === 0) {
                    this.initPerformanceMonitoring();
                }
            }
            
            // Restore neuron positions and pages
            for (const neuronId in data.neurons) {
                const neuronData = data.neurons[neuronId];
                const pageId = neuronData.pageId;
                
                // Skip if we already have this page
                if (this.pageNeurons[pageId]) continue;
                
                // Create neuron at the saved position
                const position = {
                    x: neuronData.left,
                    y: neuronData.top
                };
                
                this.createNeuron(pageId, neuronData.label, position);
            }
            
            // Restore synapses
            for (const synapseId of data.synapses) {
                const [fromId, toId] = synapseId.split('_');
                this.createSynapse(fromId, toId);
            }
            
            // Restore IDs
            this.lastNeuronId = Math.max(this.lastNeuronId, data.lastNeuronId || 0);
            this.lastTabId = Math.max(this.lastTabId, data.lastTabId || 0);
            
        } catch (e) {
            console.error('Failed to load from local storage:', e);
        }
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new BrainBrowser();
    
    // Create an initial tab to get started
    app.createNewTab();
});
