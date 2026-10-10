import globalData from '@csstools/postcss-global-data'
import customMedia from 'postcss-custom-media'
import nested from 'postcss-nested'

export default {
	plugins: [globalData({ files: ['src/styles/media.css'] }), customMedia(), nested()],
}
