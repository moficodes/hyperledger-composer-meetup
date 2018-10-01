
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getParticipantRegistry */

/**
 * @param {org.meetup.ibmcode.Eat} eat - the eat transaction
 * @transaction
 */
async function eat(eat) {
  let member = eat.member;

  let willEat = 0;

  if (member.state !== 'PRESENT') {
    throw new Error('Not Present Members can not eat');
  }


  if (member.full === 'STARVING') {
    willEat = 2;
  } else if (member.full === 'HUNGRY') {
    willEat = 1;
  } else {
    willEat = 0;
  }


  let food = eat.food;
  if (food.amount < willEat) {
    throw new Error('Not Enough Food');
  }

  food.amount = food.amount - willEat;
  member.full = 'FULL';

  const foodRegistry = await getAssetRegistry('org.meetup.ibmcode.Pizza');
  await foodRegistry.update(food);

  const memberRegistry = await getParticipantRegistry('org.meetup.ibmcode.Audience');
  await memberRegistry.update(member);
}


/**
 * @param {org.meetup.ibmcode.Learn} learn - the learn transaction
 * @transaction
 */
async function learn(learn) {
  const instructor = learn.instructor;

  let audiences = learn.audience;

  if (instructor.state !== 'ABSENT') {
    throw new Error('Cannot Learn From Absent Instructor');
  }

  const memberRegistry = await getParticipantRegistry('org.meetup.ibmcode.Audience');
  audiences.forEach(function (audience) {
    if (audience.topics.indexOf(instructor.teaching) === -1) {
      audience.topics.push(instructor.teaching);
      memberRegistry.update(audience);
    }
  });
}