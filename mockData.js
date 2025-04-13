/**
 * Mock Data for Brain Browser Proof of Concept
 * 
 * This file contains mock pages that will be used to simulate
 * browsing without actual web navigation.
 */

export const mockPages = {
    'home': {
        id: 'home',
        title: 'Home Page',
        content: `
            <h1>Welcome to Brain Browser</h1>
            <p>This is a demonstration of how browsing can be visualized as neural connections in a brain.</p>
            <p>Click on the links below to navigate and see how synapses form:</p>
            <ul>
                <li><a href="#" data-page-id="about">About Brain Browser</a></li>
                <li><a href="#" data-page-id="features">Features</a></li>
                <li><a href="#" data-page-id="science">The Science Behind It</a></li>
            </ul>
        `
    },
    'neuroscience': {
        id: 'neuroscience',
        title: 'Neuroscience Principles',
        content: `
            <h1>Neuroscience Principles</h1>
            <p>Brain Browser incorporates several key principles from neuroscience:</p>
            <ul>
                <li><strong>Hebbian Learning:</strong> "Neurons that fire together, wire together" - connections strengthen with repeated use</li>
                <li><strong>Neural Plasticity:</strong> The brain's ability to reorganize itself by forming new neural connections</li>
                <li><strong>Associative Memory:</strong> How related concepts become linked in memory networks</li>
                <li><strong>Spreading Activation:</strong> How activation of one concept activates related concepts</li>
            </ul>
            <p>Further exploration:</p>
            <ul>
                <li><a href="#" data-page-id="memory">Memory Formation</a></li>
                <li><a href="#" data-page-id="science">Back to Science</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'cognition': {
        id: 'cognition',
        title: 'Cognitive Models',
        content: `
            <h1>Cognitive Models</h1>
            <p>Brain Browser is informed by several cognitive models of how humans process information:</p>
            <ul>
                <li><strong>Spreading Activation Networks:</strong> How concepts connect and activate each other</li>
                <li><strong>Connectionist Models:</strong> Understanding cognition as networks of simple units</li>
                <li><strong>Knowledge Graphs:</strong> Representing relationships between concepts</li>
                <li><strong>Mental Models:</strong> How we build internal representations of the world</li>
            </ul>
            <p>Additional cognitive topics:</p>
            <ul>
                <li><a href="#" data-page-id="attention">Attention Systems</a></li>
                <li><a href="#" data-page-id="science">Back to Science</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'search': {
        id: 'search',
        title: 'Search Capabilities',
        content: `
            <h1>Neural Search Capabilities</h1>
            <p>Brain Browser offers innovative ways to search your browsing history:</p>
            <ul>
                <li><strong>Neural Path Search:</strong> Follow the pathways of your thoughts</li>
                <li><strong>Association Search:</strong> Find content based on contextual associations</li>
                <li><strong>Visual History:</strong> Scan your neural map to visually locate content</li>
                <li><strong>Temporal Navigation:</strong> Travel through your browsing timeline</li>
            </ul>
            <p>Try these search examples:</p>
            <ul>
                <li><a href="#" data-page-id="navigation">Back to Navigation</a></li>
                <li><a href="#" data-page-id="features">Back to Features</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'visualization': {
        id: 'visualization',
        title: 'Visualization Details',
        content: `
            <h1>Visualization Details</h1>
            <p>Brain Browser uses advanced visualization techniques to represent your browsing as neural activity:</p>
            <ul>
                <li><strong>Dynamic Neuron Positioning:</strong> Neurons organically position themselves based on content relationships</li>
                <li><strong>Adaptive Synapse Strength:</strong> Connections grow stronger with repeated use</li>
                <li><strong>Contextual Coloring:</strong> Colors help identify different types of content</li>
                <li><strong>Interactive Zoom:</strong> Explore your neural network at different scales</li>
            </ul>
            <p>Related topics:</p>
            <ul>
                <li><a href="#" data-page-id="interface">User Interface</a></li>
                <li><a href="#" data-page-id="features">Back to Features</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'navigation': {
        id: 'navigation',
        title: 'Navigation Features',
        content: `
            <h1>Navigation Features</h1>
            <p>Brain Browser reimagines how you navigate the web:</p>
            <ul>
                <li><strong>Neural Search:</strong> Find content by exploring your neural network</li>
                <li><strong>Path Replay:</strong> Retrace and replay your browsing sessions</li>
                <li><strong>Contextual Suggestions:</strong> Get recommendations based on your neural patterns</li>
                <li><strong>Focus Mode:</strong> Highlight specific neural pathways while dimming others</li>
            </ul>
            <p>Learn more about navigation:</p>
            <ul>
                <li><a href="#" data-page-id="search">Search Capabilities</a></li>
                <li><a href="#" data-page-id="features">Back to Features</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'team': {
        id: 'team',
        title: 'Our Team',
        content: `
            <h1>Our Team</h1>
            <p>Brain Browser was developed by a team of neuroscientists, web developers, and UX designers passionate about creating innovative ways to visualize information.</p>
            <p>Our mission is to transform how people understand their browsing habits by providing beautiful and insightful visualizations.</p>
            <p>Learn more about:</p>
            <ul>
                <li><a href="#" data-page-id="careers">Join Our Team</a></li>
                <li><a href="#" data-page-id="about">Back to About</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'technology': {
        id: 'technology',
        title: 'Technology',
        content: `
            <h1>Technology Behind Brain Browser</h1>
            <p>Brain Browser leverages cutting-edge web technologies to create its immersive neural visualization:</p>
            <ul>
                <li><strong>Dynamic SVG:</strong> For fluid, responsive neural connections</li>
                <li><strong>Physics Simulation:</strong> To create organic neuron placement</li>
                <li><strong>CSS Animations:</strong> For lifelike neural pulsing and activity</li>
                <li><strong>Local Storage:</strong> To maintain your neural network between sessions</li>
            </ul>
            <p>More technical details:</p>
            <ul>
                <li><a href="#" data-page-id="architecture">System Architecture</a></li>
                <li><a href="#" data-page-id="about">Back to About</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'about': {
        id: 'about',
        title: 'About Brain Browser',
        content: `
            <h1>About Brain Browser</h1>
            <p>Brain Browser is a conceptual web application that visualizes web browsing as a neural network.</p>
            <p>Each tab represents a neuron in a brain-like network, and connections between pages form synapses.</p>
            <p>This creates a visual representation of your browsing journey.</p>
            <p>Learn more:</p>
            <ul>
                <li><a href="#" data-page-id="team">Our Team</a></li>
                <li><a href="#" data-page-id="technology">Technology</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'features': {
        id: 'features',
        title: 'Features',
        content: `
            <h1>Features</h1>
            <p>Brain Browser comes with a variety of innovative features:</p>
            <ul>
                <li><strong>Neural Visualization:</strong> See your tabs as neurons in a brain network</li>
                <li><strong>Synaptic Connections:</strong> Watch connections form as you navigate</li>
                <li><strong>History Pathways:</strong> Browsing history visualized as neural pathways</li>
                <li><strong>Context Awareness:</strong> Related tabs form closer clusters</li>
            </ul>
            <p>Explore more specific features:</p>
            <ul>
                <li><a href="#" data-page-id="visualization">Visualization Details</a></li>
                <li><a href="#" data-page-id="navigation">Navigation Features</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'science': {
        id: 'science',
        title: 'The Science Behind It',
        content: `
            <h1>The Science Behind Brain Browser</h1>
            <p>Brain Browser is inspired by actual neuroscience and how the human brain processes information.</p>
            <p>The visualization mimics several neural processes:</p>
            <ul>
                <li><strong>Neuroplasticity:</strong> The brain's ability to form new connections</li>
                <li><strong>Neural Pathways:</strong> How information travels through the brain</li>
                <li><strong>Clustering:</strong> How related concepts group together</li>
            </ul>
            <p>Dive deeper into the science:</p>
            <ul>
                <li><a href="#" data-page-id="neuroscience">Neuroscience Principles</a></li>
                <li><a href="#" data-page-id="cognition">Cognitive Models</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'memory': {
        id: 'memory',
        title: 'Memory Formation',
        content: `
            <h1>Memory Formation</h1>
            <p>Brain Browser uses principles of memory formation to enhance your browsing experience:</p>
            <ul>
                <li><strong>Encoding:</strong> How information is initially learned and stored</li>
                <li><strong>Consolidation:</strong> The process of stabilizing a memory trace</li>
                <li><strong>Retrieval:</strong> Accessing stored information when needed</li>
            </ul>
            <p>Explore more about memory:</p>
            <ul>
                <li><a href="#" data-page-id="neuroscience">Neuroscience Principles</a></li>
                <li><a href="#" data-page-id="cognition">Cognitive Models</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'attention': {
        id: 'attention',
        title: 'Attention Systems',
        content: `
            <h1>Attention Systems</h1>
            <p>Brain Browser implements attention mechanisms inspired by human cognitive systems:</p>
            <ul>
                <li><strong>Focus Highlighting:</strong> Active neurons and pathways become more prominent</li>
                <li><strong>Context Dimming:</strong> Less relevant connections fade into the background</li>
                <li><strong>Temporal Attention:</strong> Recently accessed nodes maintain higher activation</li>
                <li><strong>Spatial Attention:</strong> Nearby neurons are more likely to be related</li>
            </ul>
            <p>Related topics:</p>
            <ul>
                <li><a href="#" data-page-id="cognition">Back to Cognitive Models</a></li>
                <li><a href="#" data-page-id="interface">User Interface</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'interface': {
        id: 'interface',
        title: 'User Interface',
        content: `
            <h1>User Interface Design</h1>
            <p>Brain Browser's interface is designed for intuitive interaction with your neural network:</p>
            <ul>
                <li><strong>Minimap Navigation:</strong> Quick overview and navigation of your entire network</li>
                <li><strong>Zoom Controls:</strong> Examine connections at different levels of detail</li>
                <li><strong>Drag & Drop:</strong> Reorganize neurons to create meaningful layouts</li>
                <li><strong>Visual Feedback:</strong> Immediate response to user interactions</li>
            </ul>
            <p>Explore more:</p>
            <ul>
                <li><a href="#" data-page-id="visualization">Visualization Details</a></li>
                <li><a href="#" data-page-id="features">Feature Overview</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'careers': {
        id: 'careers',
        title: 'Join Our Team',
        content: `
            <h1>Join Our Team</h1>
            <p>We're looking for passionate individuals to help us revolutionize how people interact with their browsing history:</p>
            <ul>
                <li><strong>Software Engineers:</strong> Build the next generation of neural visualization</li>
                <li><strong>UX Designers:</strong> Create intuitive interfaces for complex data</li>
                <li><strong>Data Scientists:</strong> Develop algorithms for neural clustering</li>
                <li><strong>Neuroscience Consultants:</strong> Inform our biological modeling</li>
            </ul>
            <p>Learn more about:</p>
            <ul>
                <li><a href="#" data-page-id="team">Our Current Team</a></li>
                <li><a href="#" data-page-id="technology">Our Technology</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'architecture': {
        id: 'architecture',
        title: 'System Architecture',
        content: `
            <h1>System Architecture</h1>
            <p>Brain Browser is built on a modern, scalable architecture:</p>
            <ul>
                <li><strong>Frontend Layer:</strong> Responsive UI and visualization engine</li>
                <li><strong>Core Services:</strong> Neural modeling and state management</li>
                <li><strong>Data Layer:</strong> Efficient storage and retrieval of browsing data</li>
                <li><strong>Rendering Pipeline:</strong> High-performance graphics processing</li>
            </ul>
            <p>Technical details:</p>
            <ul>
                <li><a href="#" data-page-id="technology">Technology Stack</a></li>
                <li><a href="#" data-page-id="visualization">Visualization Engine</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    },
    'learning': {
        id: 'learning',
        title: 'Learning Algorithms',
        content: `
            <h1>Learning Algorithms</h1>
            <p>Brain Browser employs sophisticated learning algorithms to improve over time:</p>
            <ul>
                <li><strong>Pattern Recognition:</strong> Identifying common browsing patterns</li>
                <li><strong>Adaptive Clustering:</strong> Dynamic organization of related content</li>
                <li><strong>Reinforcement Learning:</strong> Strengthening frequently used paths</li>
                <li><strong>Predictive Navigation:</strong> Anticipating user behavior</li>
            </ul>
            <p>Related topics:</p>
            <ul>
                <li><a href="#" data-page-id="neuroscience">Neuroscience Principles</a></li>
                <li><a href="#" data-page-id="technology">Technology Stack</a></li>
                <li><a href="#" data-page-id="home">Back to Home</a></li>
            </ul>
        `
    }
    // Additional pages can be added here following the same structure
    // 'additionalPage': {
    //     id: 'additionalPage',
    //     title: 'Additional Page Title',
    //     content: `
    //         <h1>Additional Page Content</h1>
    //         <p>This is the content for the additional page.</p>
    //         <p>More links can be added here:</p>
    //         <ul>
    //             <li><a href="#" data-page-id="home">Back to Home</a></li>
    //             <li><a href="#" data-page-id="about">Back to About</a></li>
    //         </ul>
    //     `
    // }

};

// URLs for each page - these would be replaced with actual mock HTML files in a real implementation
export const mockPageUrls = {
    'home': 'https://brainbrowser.example/home',
    'about': 'https://brainbrowser.example/about',
    'features': 'https://brainbrowser.example/features',
    'science': 'https://brainbrowser.example/science',
    'team': 'https://brainbrowser.example/team',
    'technology': 'https://brainbrowser.example/technology',
    'visualization': 'https://brainbrowser.example/visualization',
    'navigation': 'https://brainbrowser.example/navigation',
    'neuroscience': 'https://brainbrowser.example/neuroscience',
    'cognition': 'https://brainbrowser.example/cognition',
    'search': 'https://brainbrowser.example/search',
    'memory': 'https://brainbrowser.example/memory',
    'attention': 'https://brainbrowser.example/attention',
    'interface': 'https://brainbrowser.example/interface',
    'careers': 'https://brainbrowser.example/careers',
    'architecture': 'https://brainbrowser.example/architecture',
    'learning': 'https://brainbrowser.example/learning'
};


   