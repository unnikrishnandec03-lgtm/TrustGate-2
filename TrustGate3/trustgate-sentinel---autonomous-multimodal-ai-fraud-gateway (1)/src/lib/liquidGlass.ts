/**
 * Liquid Glass WebGL Engine
 * Faithful implementation of dashersw/liquid-glass-js
 * https://github.com/dashersw/liquid-glass-js
 *
 * Provides real-time WebGL refraction, chromatic dispersion,
 * signed distance field (SDF) masking (rounded rect, circle, pill),
 * and dynamic multi-layer glass effects.
 */

export interface LiquidGlassOptions {
  borderRadius?: number;
  type?: 'rounded' | 'circle' | 'pill';
  tintOpacity?: number;
  tintColor?: string; // hex, e.g. '#06b6d4' or '#ffffff'
  blurAmount?: number;
  refraction?: number;
  chromaticAberration?: number;
  rippleEffect?: number;
  cornerBoost?: number;
  edgeIntensity?: number;
  rimIntensity?: number;
  baseIntensity?: number;
  warp?: boolean;
}

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texcoord;
  varying vec2 v_texcoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texcoord = a_texcoord;
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform vec2 u_textureSize;
  uniform float u_blurRadius;
  uniform float u_borderRadius;
  uniform float u_warp;
  uniform float u_edgeIntensity;
  uniform float u_rimIntensity;
  uniform float u_baseIntensity;
  uniform float u_edgeDistance;
  uniform float u_rimDistance;
  uniform float u_baseDistance;
  uniform float u_cornerBoost;
  uniform float u_rippleEffect;
  uniform float u_tintOpacity;
  uniform vec3 u_tintColor;
  uniform float u_chromaticAberration;
  uniform int u_shapeType; // 0 = rounded, 1 = circle, 2 = pill

  varying vec2 v_texcoord;

  float roundedRectDistance(vec2 coord, vec2 size, float radius) {
    vec2 center = size * 0.5;
    vec2 pixelCoord = coord * size;
    vec2 toCorner = abs(pixelCoord - center) - (center - radius);
    float outsideCorner = length(max(toCorner, 0.0));
    float insideCorner = min(max(toCorner.x, toCorner.y), 0.0);
    return (outsideCorner + insideCorner - radius);
  }

  float circleDistance(vec2 coord, vec2 size, float radius) {
    vec2 pixelCoord = coord * size;
    vec2 centerPixel = size * 0.5;
    float distFromCenter = length(pixelCoord - centerPixel);
    return distFromCenter - radius;
  }

  float pillDistance(vec2 coord, vec2 size, float radius) {
    vec2 center = size * 0.5;
    vec2 pixelCoord = coord * size;
    vec2 capsuleStart = vec2(radius, center.y);
    vec2 capsuleEnd = vec2(size.x - radius, center.y);
    vec2 capsuleAxis = capsuleEnd - capsuleStart;
    float capsuleLength = length(capsuleAxis);

    if (capsuleLength > 0.0) {
      vec2 toPoint = pixelCoord - capsuleStart;
      float t = clamp(dot(toPoint, capsuleAxis) / dot(capsuleAxis, capsuleAxis), 0.0, 1.0);
      vec2 closestPointOnAxis = capsuleStart + t * capsuleAxis;
      return length(pixelCoord - closestPointOnAxis) - radius;
    } else {
      return length(pixelCoord - center) - radius;
    }
  }

  void main() {
    vec2 coord = v_texcoord;
    vec2 textureCoord = coord;

    float distFromEdgeShape;
    vec2 shapeNormal;

    if (u_shapeType == 2) {
      distFromEdgeShape = -pillDistance(coord, u_resolution, u_borderRadius);
      vec2 pixelCoord = coord * u_resolution;
      vec2 center = u_resolution * 0.5;
      vec2 capsuleStart = vec2(u_borderRadius, center.y);
      vec2 capsuleEnd = vec2(u_resolution.x - u_borderRadius, center.y);
      vec2 capsuleAxis = capsuleEnd - capsuleStart;
      float capsuleLength = length(capsuleAxis);
      if (capsuleLength > 0.0) {
        vec2 toPoint = pixelCoord - capsuleStart;
        float t = clamp(dot(toPoint, capsuleAxis) / dot(capsuleAxis, capsuleAxis), 0.0, 1.0);
        vec2 closestPoint = capsuleStart + t * capsuleAxis;
        vec2 normalDir = pixelCoord - closestPoint;
        shapeNormal = length(normalDir) > 0.0 ? normalize(normalDir) : vec2(0.0, 1.0);
      } else {
        shapeNormal = normalize(coord - vec2(0.5));
      }
    } else if (u_shapeType == 1) {
      distFromEdgeShape = -circleDistance(coord, u_resolution, u_borderRadius);
      shapeNormal = normalize(coord - vec2(0.5));
    } else {
      distFromEdgeShape = -roundedRectDistance(coord, u_resolution, u_borderRadius);
      shapeNormal = normalize(coord - vec2(0.5));
    }

    distFromEdgeShape = max(distFromEdgeShape, 0.0);
    float normalizedDistance = distFromEdgeShape / min(u_resolution.x, u_resolution.y);

    float baseIntensity = 1.0 - exp(-normalizedDistance * u_baseDistance);
    float edgeIntensity = exp(-normalizedDistance * u_edgeDistance);
    float rimIntensity = exp(-normalizedDistance * u_rimDistance);

    float baseComponent = u_warp > 0.5 ? baseIntensity * u_baseIntensity : 0.0;
    float totalIntensity = baseComponent + edgeIntensity * u_edgeIntensity + rimIntensity * u_rimIntensity;

    vec2 baseRefraction = shapeNormal * totalIntensity;

    float cornerProximityX = min(coord.x, 1.0 - coord.x);
    float cornerProximityY = min(coord.y, 1.0 - coord.y);
    float cornerDistance = max(cornerProximityX, cornerProximityY);
    float cornerBoost = exp(-cornerDistance * 4.0) * u_cornerBoost;
    vec2 cornerRefraction = shapeNormal * cornerBoost;

    vec2 perpendicular = vec2(-shapeNormal.y, shapeNormal.x);
    float ripple = sin(distFromEdgeShape * 0.15) * u_rippleEffect * rimIntensity;
    vec2 textureRefraction = perpendicular * ripple;

    vec2 totalRefraction = baseRefraction + cornerRefraction + textureRefraction;

    // Chromatic Aberration Dispersion
    vec2 chromaOffset = shapeNormal * (u_chromaticAberration * 0.02);
    vec2 texelSize = 1.0 / max(u_textureSize, vec2(1.0));
    vec2 blurStep = texelSize * (u_blurRadius / 2.0);

    vec4 color = vec4(0.0);
    float totalWeight = 0.0;

    for (float i = -3.0; i <= 3.0; i += 1.0) {
      for (float j = -3.0; j <= 3.0; j += 1.0) {
        float d = length(vec2(i, j));
        if (d > 3.0) continue;
        float w = exp(-(d * d) / 4.0);
        vec2 offset = vec2(i, j) * blurStep;

        float r = texture2D(u_image, textureCoord + totalRefraction + chromaOffset + offset).r;
        float g = texture2D(u_image, textureCoord + totalRefraction + offset).g;
        float b = texture2D(u_image, textureCoord + totalRefraction - chromaOffset + offset).b;
        float a = texture2D(u_image, textureCoord + totalRefraction + offset).a;

        color += vec4(r, g, b, a) * w;
        totalWeight += w;
      }
    }

    if (totalWeight > 0.0) {
      color /= totalWeight;
    }

    // Specular Rim Highlight
    float specularGlow = pow(rimIntensity, 2.5) * 1.4;
    vec3 glassTint = mix(color.rgb, u_tintColor, u_tintOpacity);
    glassTint += vec3(specularGlow * 0.6, specularGlow * 0.8, specularGlow);

    // Shape Mask via SDF
    float maskDist;
    if (u_shapeType == 2) {
      maskDist = pillDistance(coord, u_resolution, u_borderRadius);
    } else if (u_shapeType == 1) {
      maskDist = circleDistance(coord, u_resolution, u_borderRadius);
    } else {
      maskDist = roundedRectDistance(coord, u_resolution, u_borderRadius);
    }

    float mask = 1.0 - smoothstep(-1.0, 1.0, maskDist);
    gl_FragColor = vec4(glassTint, mask * color.a);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
    const g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
    const b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
    return [r, g, b];
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 1;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 1;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 1;
  return [r, g, b];
}

export class LiquidGlassEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texcoordBuffer: WebGLBuffer | null = null;
  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  private attribLocations: Record<string, number> = {};
  private options: Required<LiquidGlassOptions>;
  private isDisposed = false;

  constructor(canvas: HTMLCanvasElement, options: LiquidGlassOptions = {}) {
    this.canvas = canvas;
    this.options = {
      borderRadius: options.borderRadius ?? 24,
      type: options.type ?? 'rounded',
      tintOpacity: options.tintOpacity ?? 0.25,
      tintColor: options.tintColor ?? '#06b6d4',
      blurAmount: options.blurAmount ?? 1.8,
      refraction: options.refraction ?? 0.5,
      chromaticAberration: options.chromaticAberration ?? 0.35,
      rippleEffect: options.rippleEffect ?? 0.4,
      cornerBoost: options.cornerBoost ?? 0.2,
      edgeIntensity: options.edgeIntensity ?? 0.25,
      rimIntensity: options.rimIntensity ?? 0.6,
      baseIntensity: options.baseIntensity ?? 0.15,
      warp: options.warp ?? true,
    };

    this.initGL();
  }

  private initGL() {
    const gl =
      this.canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
      }) ||
      (this.canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      console.warn('WebGL not supported for LiquidGlass');
      return;
    }
    this.gl = gl;

    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('LiquidGlass program link failed:', gl.getProgramInfoLog(program));
      return;
    }
    this.program = program;

    // Buffers
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    this.texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]),
      gl.STATIC_DRAW
    );

    // Locations
    this.attribLocations.a_position = gl.getAttribLocation(program, 'a_position');
    this.attribLocations.a_texcoord = gl.getAttribLocation(program, 'a_texcoord');

    const uniforms = [
      'u_image',
      'u_resolution',
      'u_textureSize',
      'u_blurRadius',
      'u_borderRadius',
      'u_warp',
      'u_edgeIntensity',
      'u_rimIntensity',
      'u_baseIntensity',
      'u_edgeDistance',
      'u_rimDistance',
      'u_baseDistance',
      'u_cornerBoost',
      'u_rippleEffect',
      'u_tintOpacity',
      'u_tintColor',
      'u_chromaticAberration',
      'u_shapeType',
    ];

    uniforms.forEach((u) => {
      this.uniformLocations[u] = gl.getUniformLocation(program, u);
    });

    // Texture
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Default 1x1 placeholder texture
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([10, 18, 30, 255])
    );
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('LiquidGlass shader error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  public updateOptions(newOptions: Partial<LiquidGlassOptions>) {
    this.options = { ...this.options, ...newOptions };
  }

  public render(sourceElement?: HTMLCanvasElement | HTMLImageElement | ImageData | null) {
    if (this.isDisposed || !this.gl || !this.program) return;
    const gl = this.gl;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    // Update texture if source provided
    if (sourceElement && this.texture) {
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      try {
        if (sourceElement instanceof ImageData) {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            sourceElement.width,
            sourceElement.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            sourceElement.data
          );
        } else {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            sourceElement
          );
        }
      } catch (err) {
        // Fallback or cross-origin canvas security notice
      }
    }

    // Bind Attributes
    if (this.attribLocations.a_position !== -1 && this.positionBuffer) {
      gl.enableVertexAttribArray(this.attribLocations.a_position);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.vertexAttribPointer(this.attribLocations.a_position, 2, gl.FLOAT, false, 0, 0);
    }

    if (this.attribLocations.a_texcoord !== -1 && this.texcoordBuffer) {
      gl.enableVertexAttribArray(this.attribLocations.a_texcoord);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
      gl.vertexAttribPointer(this.attribLocations.a_texcoord, 2, gl.FLOAT, false, 0, 0);
    }

    // Set Uniforms
    const shapeCode =
      this.options.type === 'pill' ? 2 : this.options.type === 'circle' ? 1 : 0;
    const [tr, tg, tb] = hexToRgb(this.options.tintColor);

    gl.uniform2f(this.uniformLocations.u_resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniformLocations.u_textureSize, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uniformLocations.u_blurRadius, this.options.blurAmount);
    gl.uniform1f(this.uniformLocations.u_borderRadius, this.options.borderRadius);
    gl.uniform1f(this.uniformLocations.u_warp, this.options.warp ? 1.0 : 0.0);
    gl.uniform1f(this.uniformLocations.u_edgeIntensity, this.options.edgeIntensity * this.options.refraction);
    gl.uniform1f(this.uniformLocations.u_rimIntensity, this.options.rimIntensity);
    gl.uniform1f(this.uniformLocations.u_baseIntensity, this.options.baseIntensity * this.options.refraction);
    gl.uniform1f(this.uniformLocations.u_edgeDistance, 28.0);
    gl.uniform1f(this.uniformLocations.u_rimDistance, 45.0);
    gl.uniform1f(this.uniformLocations.u_baseDistance, 14.0);
    gl.uniform1f(this.uniformLocations.u_cornerBoost, this.options.cornerBoost);
    gl.uniform1f(this.uniformLocations.u_rippleEffect, this.options.rippleEffect);
    gl.uniform1f(this.uniformLocations.u_tintOpacity, this.options.tintOpacity);
    gl.uniform3f(this.uniformLocations.u_tintColor, tr, tg, tb);
    gl.uniform1f(this.uniformLocations.u_chromaticAberration, this.options.chromaticAberration);
    gl.uniform1i(this.uniformLocations.u_shapeType, shapeCode);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  public resize(width: number, height: number) {
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.render();
    }
  }

  public dispose() {
    this.isDisposed = true;
    if (this.gl) {
      if (this.texture) this.gl.deleteTexture(this.texture);
      if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
      if (this.texcoordBuffer) this.gl.deleteBuffer(this.texcoordBuffer);
      if (this.program) this.gl.deleteProgram(this.program);
    }
  }
}
