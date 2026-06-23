<template>
    <!-- svg 标签，保留 xmlns、viewBox 属性，其余属性删除 -->
    <!-- path 标签，保留 fill、d 属性，其余属性删除 -->
    <template v-if="props.icon === 'home'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24">
            <path fill="currentcolor" d="M6.7,9.2v1.7c0,0.5-0.4,0.8-0.8,0.8c-0.5,0-0.8-0.4-0.8-0.8V9.2c0-0.5,0.4-0.8,0.8-0.8C6.3,8.3,6.7,8.7,6.7,9.2  z" />
            <path fill="currentcolor" d="M10.8,7.5v3.3c0,0.5-0.4,0.8-0.8,0.8s-0.8-0.4-0.8-0.8V7.5C9.2,7,9.5,6.7,10,6.7S10.8,7,10.8,7.5z" />
            <path fill="currentcolor" d="M15,5.8v5c0,0.5-0.4,0.8-0.8,0.8c-0.5,0-0.8-0.4-0.8-0.8v-5c0-0.5,0.4-0.8,0.8-0.8C14.6,5,15,5.4,15,5.8z" />
            <path fill="currentcolor" d="M18,0H2C0.9,0,0,0.9,0,2v12.7c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V2C20,0.9,19.1,0,18,0z M18,14.7H2V2h16V14.7z  " />
            <path fill="currentcolor" d="M6.7,19.2c0-0.5,0.4-0.8,0.8-0.8h5c0.5,0,0.8,0.4,0.8,0.8c0,0.5-0.4,0.8-0.8,0.8h-5C7,20,6.7,19.6,6.7,19.2z" />
        </svg>
    </template>
    <template v-if="props.icon === 'setting'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24">
            <path fill="currentcolor" d="M7,0H2C0.9,0,0,0.9,0,2v5c0,1.1,0.9,2,2,2h5c1.1,0,2-0.9,2-2V2C9,0.9,8.1,0,7,0z M7,7H2V2h5V7z" />
            <path fill="currentcolor" d="M15.5,0C13,0,11,2,11,4.5S13,9,15.5,9S20,7,20,4.5S18,0,15.5,0z M15.5,7C14.1,7,13,5.9,13,4.5S14.1,2,15.5,2  S18,3.1,18,4.5S16.9,7,15.5,7z" />
            <path fill="currentcolor" d="M7,11H2c-1.1,0-2,0.9-2,2v5c0,1.1,0.9,2,2,2h5c1.1,0,2-0.9,2-2v-5C9,11.9,8.1,11,7,11z M7,18H2v-5h5V18z" />
            <path fill="currentcolor" d="M18,11h-5c-1.1,0-2,0.9-2,2v5c0,1.1,0.9,2,2,2h5c1.1,0,2-0.9,2-2v-5C20,11.9,19.1,11,18,11z M18,18h-5v-5h5V18z  " />
        </svg>
    </template>
    <template v-if="props.icon === 'user'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24">
            <path fill="currentcolor" d="M18,0H2C0.9,0,0,0.9,0,2v16c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V2C20,0.9,19.1,0,18,0z M18,18H2V7h7.5v3.1  C9.2,10.3,9,10.6,9,11c0,0.5,0.5,1,1,1s1-0.5,1-1c0-0.4-0.2-0.7-0.5-0.9V7H18V18z M18,6h-7.5V4.9C10.8,4.7,11,4.4,11,4  c0-0.5-0.5-1-1-1S9,3.4,9,4c0,0.4,0.2,0.7,0.5,0.9V6H2V2h16V6z" />
        </svg>
    </template>
    <template v-if="props.icon === 'role'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24">
            <path fill="currentcolor" d="M17,3c0,0.3-0.2,0.5-0.5,0.5h-2C14.2,3.5,14,3.3,14,3c0-0.3,0.2-0.5,0.5-0.5h2C16.8,2.5,17,2.7,17,3z" />
            <path fill="currentcolor" d="M18,0H2C0.9,0,0,0.9,0,2v2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V2C20,0.9,19.1,0,18,0z M18,4H2V2h16V4z" />
            <path fill="currentcolor" d="M17,10c0,0.3-0.2,0.5-0.5,0.5h-2c-0.3,0-0.5-0.2-0.5-0.5c0-0.3,0.2-0.5,0.5-0.5h2C16.8,9.5,17,9.7,17,10z" />
            <path fill="currentcolor" d="M18,7H2C0.9,7,0,7.9,0,9v2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V9C20,7.9,19.1,7,18,7z M18,11H2V9h16V11z" />
            <path fill="currentcolor" d="M17,17c0,0.3-0.2,0.5-0.5,0.5h-2c-0.3,0-0.5-0.2-0.5-0.5c0-0.3,0.2-0.5,0.5-0.5h2C16.8,16.5,17,16.7,17,17z" />
            <path fill="currentcolor" d="M18,14H2c-1.1,0-2,0.9-2,2v2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2v-2C20,14.9,19.1,14,18,14z M18,18H2v-2h16V18z  " />
        </svg>
    </template>
    <template v-if="props.icon === 'camera'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24">
            <path fill="currentcolor" d="M8,6.5v1C8,7.8,7.8,8,7.5,8h-1C6.2,8,6,7.8,6,7.5v-1C6,6.2,6.2,6,6.5,6h1C7.8,6,8,6.2,8,6.5z" />
            <path fill="currentcolor" d="M19.4,3.4l-2.8-2.8C16.2,0.2,15.7,0,15.2,0H2C0.9,0,0,0.9,0,2v16c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V4.8  C20,4.3,19.8,3.8,19.4,3.4z M18,6.5H9v1h9V18H7.5V9h-1v9H2V7.5h3v-1H2V2h4.5v3.5h1V2h7.7L18,4.8V6.5z" />
        </svg>
    </template>
    <template v-if="props.icon === 'task'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24">
            <path fill="currentcolor" d="M2 4H5H15H18V18H2V4ZM14 2H6V1C6 0.447715 5.55228 0 5 0C4.44771 0 4 0.447715 4 1L4 2H2C0.895431 2 0 2.89543 0 4V18C0 19.1046 0.895431 20 2 20H18C19.1046 20 20 19.1046 20 18V4C20 2.89543 19.1046 2 18 2H16V1C16 0.447715 15.5523 0 15 0C14.4477 0 14 0.447715 14 1V2ZM5 14C4.44772 14 4 13.5523 4 13C4 12.4477 4.44772 12 5 12L13 12C13.5523 12 14 12.4477 14 13C14 13.5523 13.5523 14 13 14L5 14ZM8 10C8.55228 10 9 9.55229 9 9C9 8.44772 8.55229 8 8 8H5C4.44772 8 4 8.44772 4 9C4 9.55229 4.44772 10 5 10H8Z" />
        </svg>
    </template>
</template>

<script lang="ts" setup>
    const props = defineProps({
        icon: {
            type: String,
            default: ''
        }
    });
</script>

<style lang="scss" scoped>

</style>