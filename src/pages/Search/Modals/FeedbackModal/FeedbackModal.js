import { useDispatch, useSelector } from 'react-redux'

import { setModal } from '../../../../core/redux/actions/actions.js'
import { publicUrl } from '../../../../core/constants'
import logo from '../../../../media/images/pdsLogo.png'

import Feedback from './PDSFeedback/Feedback'

const helpPath = `${(publicUrl != null && publicUrl.length > 0 ? publicUrl : '') + '/help'}`

const FeedbackModal = (props) => {
    const dispatch = useDispatch()

    const modal = useSelector((state) => {
        const m = state.getIn(['modals', 'feedback'])
        if (typeof m.toJS === 'function') return m.toJS()
        return m
    })

    const open = modal !== false
    const handleClose = () => {
        // close modal
        dispatch(setModal(false))
    }

    return (
        <Feedback
            open={open}
            handleClose={handleClose}
            links={[
                { name: 'Help Page', link: helpPath },
                { name: 'OpenPlanetary Forum', link: 'https://forum.openplanetary.org/' },
            ]}
            logoUrl={logo}
        />
    )
}

FeedbackModal.propTypes = {}

export default FeedbackModal
