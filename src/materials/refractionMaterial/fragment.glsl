uniform sampler2D map;
uniform sampler2D envMap;
uniform sampler2D backfaceMap;
uniform vec2 resolution;

varying vec3 worldNormal;
varying vec3 viewDirection;
varying vec2 vUv;

float ior = 1.5;
float a = 0.33;

vec3 fogColor = vec3(1.0);
vec3 reflectionColor = vec3(1.0);

float fresnelFunc(vec3 viewDirection, vec3 worldNormal) {
    return pow( 1.08 + dot( viewDirection, worldNormal), 10.0 );
}

void main() {
    // screen coordinates
    vec2 uv = gl_FragCoord.xy / resolution;

    // sample backface data from texture
    vec3 backfaceNormal = texture2D(backfaceMap, uv).rgb;

    // combine backface and frontface normal
    vec3 normal = worldNormal * (1.0 - a) - backfaceNormal * a;

    // calculate refraction and apply to uv
    vec3 refracted = refract(viewDirection, normal, 1.0/ior);
    uv += refracted.xy;

    // sample map texture
    vec4 mapTex = texture2D(map, vUv);

    // sample environment texture
    vec4 tex = texture2D(envMap, uv) ;

    // calculate fresnel
    float fresnel = fresnelFunc(viewDirection, normal);

    vec4 color = tex;

    // apply fresnel
    color.rgb = mix(color.rgb, reflectionColor, fresnel);

    gl_FragColor = vec4(color.rgb * mapTex.rgb,  1.);
}